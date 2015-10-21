class ApplicationController < ActionController::Base

  # Adds a few additional behaviors into the application controller
  include Blacklight::Controller
  # Please be sure to impelement current_user and user_session. Blacklight depends on
  # these methods in order to perform user specific actions.

  layout 'vndl'

  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  # Hook up Pubtkt authentication
  before_filter :decode_user_if_pubtkt_present

  helper_method :current_user, :user_signed_in?, :user_login_url, :user_logout_url

  def decode_user_if_pubtkt_present
    # use authenticate instead of authenticate! since we
    # do not raise an error if there is a problem with the pubtkt.
    # in that case we make the current user nil
    if env['warden']
      env['warden'].authenticate(:pubtkt)
      @current_user = env['warden'].user
    end
  end

  # handle errors
  rescue_from StandardError, with: :exception_handler
  def exception_handler(exception)
    #raise exception if Rails.configuration.consider_all_requests_local
    raise exception unless ActionDispatch::ExceptionWrapper.rescue_responses[exception.class.name]

    wrapper = ActionDispatch::ExceptionWrapper.new(env, exception)
    render_response_for_error(wrapper)
  end
  protected :exception_handler

  def set_return_location_from_status_code(status_code)
    if status_code == 401
      session['user_return_to'] = env['ORIGINAL_FULLPATH']
    end
  end
  protected :set_return_location_from_status_code

  def render_response_for_error(exception)
    set_return_location_from_status_code(exception.status_code)
    render "/errors/#{exception.status_code}", status: exception.status_code, layout: !request.xhr?
  end
  protected :render_response_for_error

  # provide the "devise API" for 'user'

  def current_user
    @current_user
  end

  def user_signed_in?
    current_user != nil
  end

  def authenticate_user!(opts={})
    throw(:warden, opts) unless user_signed_in?
  end

  def user_session
    current_user && session
  end

  # path helpers, since pubtkt passes the return url as a parameter

  def user_login_url(back=nil)
    back = root_path unless back
    redirect_params = { back: back }
    "#{Rails.configuration.pubtkt_login_url}?#{redirect_params.to_query}"
  end

  def user_logout_url
    Rails.configuration.pubtkt_logout_url
  end

end
