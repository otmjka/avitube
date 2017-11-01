class BroadcastsController < ApplicationController
  def index
    @streams = Stream.where(provider: "avitube").order("name desc").includes(:recordings).all
  end

  def create
    stream_params = params[:stream].permit(:comment).merge(name: "a#{Time.now.to_i}", 
      provider: "avitube", publish_enabled: true, dvr: "movies 20G", urls: "fake://fake")
    Stream.create(stream_params)
    redirect_to "/"
  end

  def destroy
    @stream = Stream.find(params[:id])
    @stream.destroy
    redirect_to "/"
  end
end
