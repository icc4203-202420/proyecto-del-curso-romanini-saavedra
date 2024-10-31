class API::V1::AttendancesController < ApplicationController
  respond_to :json
  before_action :set_attendance, only: [:update, :destroy]
  before_action :verify_jwt_token, only: [:create, :update, :destroy]

  def index
    @attendances = Attendance.all
    render json: {attendances: @attendances}, status: :ok
  end

  def create
      @attendance = Attendance.new(attendance_params)
  
      if @attendance.save
        notify_friends(@attendance.user, @attendance.event)
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
    friends.each do |friend|
      ExpoPushNotificationService.send_notification(friend.expo_push_token, "#{user.name} is attending #{event.name}!", { eventId: event.id })
    end
  end
end