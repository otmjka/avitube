class BroadcastsController < ApplicationController
  def index
    @streams = Stream.where(provider: "avitube").order("name desc").all
  end

  def create
    Stream.create(name: "a#{Time.now.to_i}", provider: "avitube", publish_enabled: true, dvr: "movies 20G", urls: "fake://fake")
    redirect_to "/"
  end

  def destroy
    @stream = Stream.find(params[:id])
    @stream.destroy
    redirect_to "/"
  end
end
