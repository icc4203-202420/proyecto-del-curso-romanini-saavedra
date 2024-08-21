class API::V1::EventsController < ApplicationController
    include ImageProcessing
    include Authenticable

    respond_to :json
    before_action :set_event, only: [:show, :update, :destroy]
    before_action :verify_jwt_token, only: [:create, :update, :destroy]

    def show
        if @event.flyer.attached?
          render json: @event.as_json.merge({ 
            image_url: url_for(@event.flyer), 
            thumbnail_url: url_for(@event.thumbnail)}),
            status: :ok
        else
          render json: { event: @event.as_json }, status: :ok
        end 
    end

    def create
        @event = Event.new(event_params.except(:flyer_base64))
        handle_flyer_attachment if event_params[:flyer_base64]
    
        if @event.save
          render json: { event: @event, message: 'Event created successfully.' }, status: :created
        else
          render json: @event.errors, status: :unprocessable_entity
        end
    end

    def update
        handle_flyer_attachment if event_params[:flyer_base64]
    
        if @event.update(event_params.except(:flyer_base64))
          render json: { event: @event, message: 'Event updated successfully.' }, status: :ok
        else
          render json: @event.errors, status: :unprocessable_entity
        end
    end

    def destroy
        @beer.destroy
        head :no_content
    end    

    private

    def set_event
        @event = Event.find_by(id: params[:id])
        render json: { error: 'Event not found' }, status: :not_found if @event.nil?
    end

    def event_params
        params.require(:event).permit(:name, :description, :bar_id, :date, :start_date, :end_date, :flyer_base64)
    end

    def handle_flyer_attachment
        decoded_flyer = decode_flyer(event_params[:flyer_base64])
        @event.flyer.attach(io: decoded_flyer[:io], 
          filename: decoded_flyer[:filename], 
          content_type: decoded_flyer[:content_type])
    end

    def verify_jwt_token
        authenticate_user!
        head :unauthorized unless current_user
    end
end