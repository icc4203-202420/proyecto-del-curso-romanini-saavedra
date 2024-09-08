class API::V1::SessionsController < Devise::SessionsController
  include ::RackSessionsFix
  respond_to :json

  def verify_token
    if request.headers['Authorization'].present?
      token = request.headers['Authorization'].split(' ').last
      decoded_token = JWT.decode(
        token,
        Rails.application.credentials.devise_jwt_secret_key,
        true,
        { algorithm: 'HS256' }
      ).first
  
      user = User.find(decoded_token['sub'])
      render json: {
        message: 'Token is valid',
        user: UserSerializer.new(user).serializable_hash[:data][:attributes]
      }, status: :ok
    else
      render json: { error: 'Token is missing' }, status: :unauthorized
    end
  rescue JWT::DecodeError
    render json: { error: 'Invalid token' }, status: :unauthorized
  end

  def signup
    user = User.new(user_params)
    if user.save
      token = JWT.encode({ sub: user.id }, Rails.application.credentials.devise_jwt_secret_key, 'HS256')
      render json: {
        status: {
          code: 201,
          message: 'User created successfully.',
          data: {
            user: UserSerializer.new(user).serializable_hash[:data][:attributes],
            token: token
          }
        }
      }, status: :created
    else
      render json: { error: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def respond_with(current_user, _opts = {})
    token = request.env['warden-jwt_auth.token']
    render json: {
      status: {
        code: 200, 
        message: 'Logged in successfully.',
        data: { 
          user: UserSerializer.new(current_user).serializable_hash[:data][:attributes],
          token: token # Aquí devolvemos el token
        }
      }
    }, status: :ok
  end
  def respond_to_on_destroy
    if request.headers['Authorization'].present?
      jwt_payload = JWT.decode(
        request.headers['Authorization'].split(' ').last,
        Rails.application.credentials.devise_jwt_secret_key,
        true,
        { algorithm: 'HS256' }
      ).first
      current_user = User.find(jwt_payload['sub'])
    end
    
    if current_user
      render json: {
        status: 200,
        message: 'Logged out successfully.'
      }, status: :ok
    else
      render json: {
        status: 401,
        message: "Couldn't find an active session."
      }, status: :unauthorized
    end
  end
  def user_params
    params.require(:user).permit(:email, :password, :password_confirmation)
  end
end
