class API::V1::EventPicturesController < ApplicationController
  respond_to :json
  before_action :set_review, only: [:show, :destroy]

  def index
    @event_pictures = EventPicture.where(event_id: params[:event_id])
    render json: @event_pictures.map { |picture|
      {
        id: picture.id,
        description: picture.description,
        created_at: picture.created_at,
        updated_at: picture.updated_at,
        image_url: url_for(picture.image)
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
    @event_picture = EventPicture.new(event_picture_params)

    if @event_picture.save
      render json: { event_picture: @event_picture, message: "Event picture created successfully."}, status: :created
    else
      render json: @event_picture.errors, status: :unprocessable_entity
    end
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
    params.require(:event_picture).permit(:user_id, :event_id, :description, :image)
  end
end