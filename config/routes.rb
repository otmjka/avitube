Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  root "broadcasts#index"

  get "slack/auth", to: 'slack#auth'
  post "slack/logout", to: 'slack#logout'
  resources :broadcasts
end
