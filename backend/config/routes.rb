Rails.application.routes.draw do
  # devise_for :users
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html
  get 'current_user', to: 'current_user#index'
  devise_for :users, path: '', path_names: {
    sign_in: 'api/v1/login',
    sign_out: 'api/v1/logout',
    registration: 'api/v1/signup'
  },
  controllers: {
    sessions: 'api/v1/sessions',
    registrations: 'api/v1/registrations',
  }

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"

  namespace :api, defaults: { format: :json } do
    namespace :v1 do
      resources :bars do
        resources :events, only: [:index, :update, :destroy] 
      end

      resources :event_pictures, only: [:create, :index]

      resources :beers do 
        resources :reviews, only: [:create, :index, :show, :update, :destroy]
      end
      resources :users do
        # resources :reviews, only: [:index, :update, :destroy]
        # post 'reviews', to: 'reviews#create'
        get 'friendships', to: 'users#index_friendships', as: :friendships
        post 'friendships', to: 'users#create_friendship'
      end

      resources :tag_users, only: [:index, :create, :show, :destroy]
      resources :attendances, only: [:index, :show, :create, :destroy]
      resources :events, only: [:show, :create, :update, :destroy]
      # resources :reviews, only: [:show, :create, :update, :destroy]
      resources :brands, only: [:index, :show]
      resources :addresses, only: [:index, :show]
      resources :countries, only: [:index, :show]
      resources :breweries, only: [:index, :show]
      resources :bars_beers, only: [:index]
      resources :reviews, only: [:index, :show, :create, :update, :destroy]
      resources :friendships, only: [:index, :show, :create, :destroy]
      post 'verify-token', to: 'sessions#verify_token'
      devise_scope :user do
        get 'verify-token', to: 'sessions#verify_token'
      end
      post 'signup', to: 'registrations#create'
    end
  end

end
