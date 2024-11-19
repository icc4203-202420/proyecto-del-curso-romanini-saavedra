class API::V1::EventPicturesController < ApplicationController
  respond_to :json
  before_action :set_event_picture, only: [:show, :destroy]

  def index
    if params[:event_id].present?
      @event_pictures = EventPicture.where(event_id: params[:event_id])
    else
      @event_pictures = EventPicture.includes(tag_users: :tagged_user).all
    end
    render json: @event_pictures.map { |picture|
      {
        id: picture.id,
        user_id: picture.user_id,
        user: {
          handle: picture.user.handle
        },
        description: picture.description,
        event: picture.event,
        bar: picture.event.bar,
        country: picture.event.bar.address.country,
        created_at: picture.created_at,
        updated_at: picture.updated_at,
        image_url: url_for(picture.image),
        tagged_users: picture.tag_users.map { |tag_user|
          {
            id: tag_user.tagged_user.id,
            handle: tag_user.tagged_user.handle
          }
      }
      }
    }
  end

  def show
    if @event_picture
      render json: { event_picture: @event_picture }, status: :ok
    else
      render json: { error: "Event picture not found" }, status: :not_found
    end
  end

  def create
    ActiveRecord::Base.transaction do
      @event_picture = EventPicture.new(event_picture_params.except(:tagged_users))

      unless @event_picture.save
        render json: { errors: @event_picture.errors.full_messages }, status: :unprocessable_entity
        return
      end

      tagged_users = []
      if event_picture_params[:tagged_users].present?
        tagged_users = event_picture_params[:tagged_users]
        
        tagged_users.each do |tagged_user_id|
          tag_user = TagUser.create!(
            user_id: @event_picture.user_id,
            tagged_user_id: tagged_user_id,
            picture_id: @event_picture.id
          )

          notify_tagged_users({
            "user_id" => @event_picture.user_id,
            "tagged_user_id" => tag_user.tagged_user_id,
            "picture_id" => tag_user.picture_id,
            "event_id" => @event_picture.event_id
          })
        end
      end

      puts "\n\n\n\n\n\n\n\n\n\n\n"
      puts "TAGGED USERS EN CREATE EVENT_PICTURES: #{tagged_users}"
      puts "\n\n\n\n\n\n\n\n\n\n\n"

      
  
      render json: { 
        event_picture: {
          id: @event_picture.id,
          user_id: @event_picture.user_id,
          description: @event_picture.description,
          created_at: @event_picture.created_at,
          updated_at: @event_picture.updated_at,
          image_url: url_for(@event_picture.image),
          tagged_users: @event_picture.tag_users.map(&:tagged_user).map { |user|
          {
            id: user.id,
            handle: user.handle
          }

          } 
        },
        message: "Event picture created successfully."
      }, status: :created
    end
  rescue ActiveRecord::RecordInvalid => e
    render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
  end

  def destroy
    @event_picture.destroy
    head :no_content
  end

  private

  def set_event_picture
    @event_picture = EventPicture.find_by(id: params[:id])
    render json: { error: "Event picture not found." }, status: :not_found unless @event_picture
  end

  def event_picture_params
    params.require(:event_picture).permit(:user_id, :event_id, :description, :image, tagged_users: [])
  end

  def notify_tagged_users(tagged_user)
    user = User.find(tagged_user["user_id"])
    tagged_user_obj = User.find(tagged_user["tagged_user_id"])
    event = Event.find(tagged_user["event_id"])
    bar = Bar.find(event.bar_id)

    return unless tagged_user_obj.expo_push_token

    puts "TAGGED USER OBJ: #{tagged_user.inspect}"

    message = "#{user.handle} tagged you in a picture"
    # data = { pictureId: tagged_user["picture_id"], type: "tagged_image" }
    data = { event: event, bar: bar, type: "tagged_image"}

    begin
      ExpoPushNotificationService.send_notification(
        tagged_user_obj.expo_push_token,
        message,
        data,
        "New Tag"
      )
    rescue => e
      puts "Error sending notification to #{tagged_user_obj.handle}: #{e.message}"
    end 

  end
end