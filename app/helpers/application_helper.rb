module ApplicationHelper
  def logged?
    session[:user_id].present?
  end
end
