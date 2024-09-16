class API::V1::RegistrationsController < Devise::RegistrationsController
  include ::RackSessionsFix
  respond_to :json

  def create
    user = User.new(sign_up_params)
    ActiveRecord::Base.transaction do
      if user.save
        if address_params.present? && address_params.values.any?(&:present?)
          country = Country.find_by(name: address_params[:country_name])
          if country.nil?
            render json: { error: 'Country not found' }, status: :unprocessable_entity
            raise ActiveRecord::Rollback
          end
          sanitized_address_params = address_params.except(:country_name).merge(user: user, country_id: country.id)
          address = Address.new(sanitized_address_params)
          unless address.save
            render json: { error: address.errors.full_messages }, status: :unprocessable_entity
            raise ActiveRecord::Rollback
          end
        end
        render json: {
          status: { code: 201, message: 'User created successfully.' },
          data: UserSerializer.new(user).serializable_hash[:data][:attributes]
        }, status: :created
      else
        render json: { error: user.errors.full_messages }, status: :unprocessable_entity
      end
    end
  end

  private

  def sign_up_params
    params.require(:user).permit(
      :email, :first_name, :last_name, :handle,
      :password, :password_confirmation)
  end

  def address_params
    params.fetch(:address, {}).permit(:line1, :line2, :city, :country_name)
  end

  def respond_with(current_user, _opts = {})
    if resource.persisted?
      render json: {
        status: {code: 200, message: 'Signed up successfully.'},
        data: UserSerializer.new(current_user).serializable_hash[:data][:attributes]
      }
    else
      render json: {
        status: {message: "User couldn't be created successfully. #{current_user.errors.full_messages.to_sentence}"}
      }, status: :unprocessable_entity
    end
  end
end
