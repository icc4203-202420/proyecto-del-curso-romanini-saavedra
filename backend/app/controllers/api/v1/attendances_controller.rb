class API::V1::AttendancesController < ApplicationController
  respond_to :json
  before_action :set_attendance, only: [:update, :destroy]
  before_action :verify_jwt_token, only: [:create, :update, :destroy]
  before_action :set_url_options

  def index
    @attendances = Attendance.all
    render json: {attendances: @attendances}, status: :ok
  end

  def create
      @attendance = Attendance.new(attendance_params)
      user = User.find(@attendance.user_id)
      event = Event.find(@attendance.event_id)

      if @attendance.save
        notify_friends(user, event)
        render json: { attendance: @attendance, message: 'Attendance created successfully.' }, status: :created
      else
        render json: @attendance.errors, status: :unprocessable_entity
      end
  end

  def update
      if @attendance.update(attendance_params)
        render json: { attendance: @attendance, message: 'Attendance updated successfully.' }, status: :ok
      else
        render json: @attendance.errors, status: :unprocessable_entity
      end
  end

  def destroy
      @attendance.destroy
      head :no_content
  end    

  private

  def set_attendance
      @attendance = Attendance.find_by(id: params[:id])
      render json: { error: 'Attendance not found' }, status: :not_found if @attendance.nil?
  end

  def attendance_params
      params.require(:attendance).permit(:user_id, :event_id, :checked_in, :default, :false)
  end

  def verify_jwt_token
      authenticate_user!
      head :unauthorized unless current_user
  end

  def notify_friends(user, event)
    friends = user.friends.where.not(expo_push_token: nil)
    bar = Bar.where(id: event.bar_id).first
    message = "#{user.handle} is attending #{event.name} at #{bar.name}!"
    data = { event: event, bar: bar, type: "attendance" }

    friends.each do |friend|
      begin
        ExpoPushNotificationService.send_notification(
          friend.expo_push_token, 
          message, 
          data, 
          "New Event Attendance!"
        )
      rescue => e
        puts "Error sending notification to #{friend.handle}: #{e.message}"
      end
    end
  end

  def set_url_options
    ActiveStorage::Current.url_options = { host: request.host, port: request.port }
  end
end