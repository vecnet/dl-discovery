module Vecnet
  module AdminConstraint

    module_function

    def matches?(request)
      request.env['warden'].authenticate(:pubtkt)
      u = request.env['warden'].user
      u.nil? ? false : u.admin?
    rescue KeyError, NoMethodError
      return false
    end

  end
end
