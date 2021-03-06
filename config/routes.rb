Rails.application.routes.draw do
  root "static_pages#root"

  namespace :api, defaults: {format: :json} do
    resources :reviews
    resources :properties
    resource :session, only: [:create, :destroy]
    resources :users, only: [:create, :show, :update, :destroy]
  end
end
