require 'open-uri'

class GenerateEventVideoJob < ApplicationJob
  include Rails.application.routes.url_helpers
  
  queue_as :default

  def perform(event_id)
    puts "Iniciando generacion de video para evento id: #{event_id}"
    event = Event.find(event_id)
    images = event.event_pictures

    puts "Numero de imágenes obtenidas: #{images.count}"

    return if images.empty?

    output_video_path = Rails.root.join("tmp", "event_#{event.id}_slideshow.mp4")

    image_files = download_images(images)

    create_video_from_images(image_files, output_video_path)

    event.video.attach(io: File.open(output_video_path), filename: "event_#{event.id}_slideshow.mp4", content_type: "video/mp4")
    puts "Video adjuntando al evento con ID: #{event.id}"

    File.delete(output_video_path)
    image_files.each { |file| File.delete(file) }

    puts "Finalizada generacion de video para evento: #{event_id}"
    notify_attendees(event)
  end

  private
  def download_images(images)
    puts "DESCARGANDO IMAGENES"
    image_files = []
    images.each_with_index do |image, index|
      if image.image.attached?
        image_url = Rails.application.routes.url_helpers.rails_blob_url(image.image, host: ENV['BACKEND_URL_HTTP'] || 'localhost', port: 3000)
        file_path = Rails.root.join("tmp", "image_#{index}.jpg")

        OpenURI.open_uri(image_url) do |remote_file|
          File.open(file_path, "wb") do |file|
            file.write(remote_file.read)  # Asumiendo que tienes image_url para cada imagen
          end
        end
        puts "Imagen descargada y guardada en: #{file_path}"
        image_files << file_path
      else
        puts "NO HAY IMAGE ADJUNTA PARA EVENT PICTURES ID: #{image.id}"
      end
    end
    image_files
  end

  def create_video_from_images(image_files, output_path)
    file_list_path = Rails.root.join("tmp", "file_list.txt")
    File.open(file_list_path, "w") do |f|
      image_files.each do |file|
        f.puts("file '#{file}'")
        f.puts("duration 2")  
      end
      f.puts("file '#{image_files.last}'") 
    end

    `ffmpeg -f concat -safe 0 -i #{file_list_path} -vsync vfr -pix_fmt yuv420p #{output_path}`

    File.delete(file_list_path)
    puts "Video generado exitosamente en: #{output_path}"
  end

  def notify_attendees(event)
    attendees = Attendance.where(event_id: event.id)
    bar = Bar.where(id: event.bar_id).first
    attendees.each do |attendance|
      user = User.find(attendance.user_id)
      message = "The highlight video for event #{event.name} at #{bar.name} is now available!"
      data = { event: event, type: "video_generated"}

      begin
        ExpoPushNotificationService.send_notification(
          user.expo_push_token,
          message, 
          data,
          "Event Highlight Video is Ready to Watch!"
        )
      rescue => e
        puts "Error sending notification to #{user.handle}: #{e.message}"
      end
    end

  end

end
