class API::V1::TagUsersController < ApplicationController
  respond_to :json
  before_action :set_tag_user, only: [:show]

  def index
    @tag_users = TagUser.all
    render json: { tag_users: @tag_users}, status: :ok
  end

  def show
    render json: { tag_user: @tag_user.as_json }, status: :ok
  end

  def create
    @tag_user = TagUser.new(tag_user_params)

    if @etag_user.save
      render json: { tag_user: @tag_user, message: "TagUser created successfully."}, status: :created
    else
      render json: @tag_user.errors, status: :unprocessable_entity
    end
  end

  private

  def set_tag_user
    @tag_user = TagUser.find_by(id: params[:id])
    render json: { error: "TagUser not found." }, status: :not_found unless @tag_user
  end

  def tag_user_params
    params.require(:tag_user).permit(:tagged_user, :user, :picture)
  end
end