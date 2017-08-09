Rails.application.routes.draw do
  resources :download, only: [:show, :file]
  post "wms/handle"
  root :to => "catalog#index"
  # use all of blacklight except the email, and sms routes
  blacklight_for :catalog, except: [:export]

  resource :feedback_form, path: 'feedback', only: [:new, :create]
  get 'feedback' => 'feedback_forms#new'

  resources :suggest, only: :index, defaults: { format: 'json' }

  %w(401 404 500).each do |code|
    get code, to: "errors#show", code: code
  end

  # since there is no pubtkt login for development
  if Rails.env.development? || Rails.env.jcu?
    match 'development_sessions/log_in' => "development_sessions#new", via: :get
    match 'development_sessions' => "development_sessions#create", via: :post
    # morally the next should be a delete action, but is a get to match how the
    # single sign on works in production
    match 'development_sessions/log_out' => "development_sessions#invalidate", via: :get
  end
end
