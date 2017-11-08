class SlackController < ApplicationController
  def auth
    req = {client_id: Slack.client_id, client_secret: Slack.secret, code: params[:code]}
    uri = URI("https://slack.com/api/oauth.access?#{req.to_query}")
    http = Net::HTTP.new(uri.host, uri.port)
    http.set_debug_output $stderr
    http.use_ssl = true
    http.verify_mode = OpenSSL::SSL::VERIFY_NONE
    request = Net::HTTP::Get.new("#{uri.path}?#{req.to_query}")
    request.add_field('Content-Type', 'application/json')
    request.add_field('Accept', 'application/json')
    res = http.request(request)

    if res.code == "200"
      reply = JSON.parse(res.body).with_indifferent_access
      if reply[:ok]
        # puts reply.inspect
        session[:user_id] = reply[:user][:id]
        session[:user_name] = reply[:user][:name]
        session[:team_id] = reply[:team][:id]
        session[:access_token] = reply[:access_token]
        redirect_to "/"
      end
      reply
    else
      nil
    end

  end

  def logout
    session.delete(:user_id)
    session.delete(:user_name)
    session.delete(:team_id)
    session.delete(:access_token)
    redirect_to "/"
  end
end
