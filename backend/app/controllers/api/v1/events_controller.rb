class API::V1::EventsController < ApplicationController
    include ImageProcessing
    include Authenticable

    respond_to :json
    before_action :set_event, only: [:show, :update, :destroy]
    before_action :verify_jwt_token, only: [:create, :update, :destroy]

    def index
      bar = Bar.find(params[:bar_id])
      events = bar.events
      render json: events, status: :ok
    end

    def show
      if @event.flyers.attached?
        render json: @event.as_json.merge({ 
          images: @event.flyers.map { |flyer| url_for(flyer) },
          thumbnails: @event.thumbnails.map { |thumb| url_for(thumb) }
        }), status: :ok
      else
        render json: { event: @event.as_json }, status: :ok
      end
    end

    def create
        @event = Event.new(event_params.except(:flyers_base64))
        handle_flyers_attachment if event_params[:flyers_base64]
    
        if @event.save
          render json: { event: @event, message: 'Event created successfully.' }, status: :created
        else
          render json: @event.errors, status: :unprocessable_entity
        end
    end

    def update
        handle_flyers_attachment if event_params[:flyers_base64]
    
        if @event.update(event_params.except(:flyers_base64))
          render json: { event: @event, message: 'Event updated successfully.' }, status: :ok
        else
          render json: @event.errors, status: :unprocessable_entity
        end
    end

    def destroy
        @event.destroy
        head :no_content
    end    

    def generate_event
      event = Event.find(params[:id])
      GenerateEventSummaryJob.perform_later(event.id)
      render json: { message: 'Video generating in process'}
    end

    private

    def set_event
        @event = Event.find_by(id: params[:id])
        render json: { error: 'Event not found' }, status: :not_found if @event.nil?
    end

    def event_params
        params.require(:event).permit(:name, :description, :bar_id, :date, :start_date, :end_date, flyers_base64: [])
    end

    def handle_flyers_attachment
      event_params[:flyers_base64].each do |flyer_base64|
        decoded_flyer = decode_flyer(flyer_base64)
        @event.flyers.attach(io: decoded_flyer[:io], 
                             filename: decoded_flyer[:filename], 
                             content_type: decoded_flyer[:content_type])
      end
    end

    def verify_jwt_token
        authenticate_user!
        head :unauthorized unless current_user
    end
end