class API::V1::TagUsersController < ApplicationController
  respond_to :json
  before_action :set_tag_user, only: [:show, :destroy]

  def index
    @tag_users = TagUser.all
    render json: { tag_users: @tag_users}, status: :ok
  end

  def show
    render json: { tag_user: @tag_user.as_json }, status: :ok
  end

  def create
    ActiveRecord::Base.transaction do
      tag_users_params[:tag_users].each do |tag_user|
        tag_user_record = TagUser.new(
          tagged_user_id: tag_user[:tagged_user_id],
          user_id: tag_user[:user_id],
          picture_id: tag_user[:picture_id]
        )
  
        unless tag_user_record.save
          render json: tag_user_record.errors, status: :unprocessable_entity and return
        end
      end
    end
    render json: { message: "TagUsers created successfully." }, status: :created
  rescue ActiveRecord::RecordInvalid => e
    render json: { error: e.message }, status: :unprocessable_entity
  rescue ActiveRecord::StatementInvalid => e
    render json: { error: e.message }, status: :internal_server_error
  end
  

  def destroy
    @tag_user.destroy
    head :no_content
  end

  private

  def set_tag_user
    @tag_user = TagUser.find_by(id: params[:id])
    render json: { error: "TagUser not found." }, status: :not_found unless @tag_user
  end

  def tag_users_params
    params.permit(tag_users: [:tagged_user_id, :user_id, :picture_id])
  end
end