Rails.application.routes.draw do
  resources :download, only: [:show, :file]
  post "wms/handle"
  root :to => "catalog#index"
  blacklight_for :catalog

  resource :feedback_form, path: 'feedback', only: [:new, :create]
  get 'feedback' => 'feedback_forms#new'


  #define a catchall route so Rails will send the request or render the public/404.html page (in production)
  match "*path", to: "errors#catch_404", via: :all

  resources :suggest, only: :index, defaults: { format: 'json' }

  # since there is no pubtkt login for development
  if Rails.env.development? || Rails.env.jcu?
    match 'development_sessions/log_in' => "development_sessions#new", via: :get
    match 'development_sessions' => "development_sessions#create", via: :post
    # morally the next should be a delete action, but is a get to match how the
    # single sign on works in production
    match 'development_sessions/log_out' => "development_sessions#invalidate", via: :get
  end
end
