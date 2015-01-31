class DevelopmentSessionsController < ApplicationController

  before_filter :ensure_development_env

  def ensure_development_env
    raise ActionController::RoutingError unless Rails.env.development?
  end

  def new
  end

  def create
    private_key = Rails.configuration.pubtkt_private_key
    if private_key
      pt = PubTicket.new
      pt.uid = params[:uid]
      pt.clientip = params[:ip] unless params[:ip].blank?
      pt.valid_until = params[:validuntil]
      pt.tokens = params[:tokens]
      pt.generate_signature(private_key)

      cookies[:auth_pubtkt] = pt.ticket
      redirect_to params[:back], :notice => "Logged in!"
    else
      flash.now.alert = "Private Key not set!"
      render "new"
    end
  end

  def invalidate
    cookies.delete :auth_pubtkt
    redirect_to root_url, :notice => "Logged out!"
  end
end
