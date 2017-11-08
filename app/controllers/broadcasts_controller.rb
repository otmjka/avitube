class BroadcastsController < ApplicationController
  before_action :ensure_logged, only: [:create, :destroy]
  def index
    @streams = Stream.where(provider: "avitube").order("name desc").includes(:recordings).all
  end

  def show
    @stream = Stream.find(params[:id])    

    @streams = Stream.where(provider: "avitube").where("name != ?", @stream.name).order("name desc").includes(:recordings).all
  end

  def create
    stream_params = params[:stream].permit(:comment).merge(name: "a#{Time.now.to_i}", 
      provider: "avitube", publish_enabled: true, dvr: "movies 20G")
    if params[:kind] == "sample"
      stream_params[:urls] = "fake://fake"
    end
    Stream.create(stream_params)
    redirect_to "/"
  end

  def destroy
    @stream = Stream.find(params[:id])
    @stream.destroy
    redirect_to "/"
  end
end
