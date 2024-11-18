class API::V1::EventPicturesController < ApplicationController
  respond_to :json
  before_action :set_event_picture, only: [:show, :destroy]

  def index
    if params[:event_id].present?
      @event_pictures = EventPicture.where(event_id: params[:event_id])
    else
      @event_pictures = EventPicture.all
    end
    render json: @event_pictures.map { |picture|
      {
        id: picture.id,
        user_id: picture.user_id,
        description: picture.description,
        event_id: picture.event_id,
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
      render json: { 
        event_picture: {
          id: @event_picture.id,
          user_id: @event_picture.user_id,
          description: @event_picture.description,
          created_at: @event_picture.created_at,
          updated_at: @event_picture.updated_at,
          image_url: url_for(@event_picture.image) # Añadido aquí
        },
        message: "Event picture created successfully."
      }, status: :created
    else
      render json: { errors: @event_picture.errors.full_messages }, status: :unprocessable_entity
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