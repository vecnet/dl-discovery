class ErrorsController < ApplicationController

  def show
    code = params[:code] || "500"
    render code.to_s, status: code.to_i
  end
end
