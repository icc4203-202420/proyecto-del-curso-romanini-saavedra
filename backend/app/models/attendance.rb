class Attendance < ApplicationRecord
  respond_to :json
  belongs_to :user
  belongs_to :event

  def index
    @attendances = Attendance.all
    render json: { attendances: @attendances }, status: :ok
  end

  def check_in
    update(checked_in: true)
  end  
end
