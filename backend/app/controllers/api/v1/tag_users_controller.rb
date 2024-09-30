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
    @tag_user = TagUser.new(tag_user_params)

    if @tag_user.save
      render json: { tag_user: @tag_user, message: "TagUser created successfully."}, status: :created
    else
      render json: @tag_user.errors, status: :unprocessable_entity
    end
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

  def tag_user_params
    params.require(:tag_user).permit(:tagged_user_id, :user_id, :picture_id)
  end
end