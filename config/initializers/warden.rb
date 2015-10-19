require 'pubtkt'

Rails.configuration.middleware.use(Warden::Manager) do |warden|
  warden.default_strategies :pubtkt
  warden.intercept_401 = false
end
