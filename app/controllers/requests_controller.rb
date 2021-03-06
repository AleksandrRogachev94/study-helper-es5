class RequestsController < ApplicationController

  before_action :authenticate_user!

  after_action :verify_policy_scoped, only: :index
  after_action :verify_authorized, only: [:destroy]

  def index
    @requests = policy_scope(Request)

    respond_to do |f|
      if @requests.empty?
        f.html { redirect_to user_studyships_path(current_user, "students"), notice: "You don't have any requests" }
        f.json { render json: { notice: ["You don't have any requests"] }, status: :ok }
      else
        f.html
        f.json { render json: @requests, each_serializer: RequestSerializer, status: :ok }
      end
    end
  end

  def create
    return redirect_to root_path, alert: "You can't be a teacher of yourself" if params[:request][:teacher_id] == current_user.id
    request = Request.new(request_params)
    request.student = current_user
    if request.save
      redirect_to user_path(request.teacher), notice: "Request sent"
    else
      redirect_to root_path, alert: "Can't make a request"
    end
  end

  def destroy
    request = Request.find_by(id: params[:id])
    return redirect_to requests_path, alert: "Request doesn't exist" if !request
    authorize request

    request.delete

    respond_to do |f|
      f.html { redirect_to requests_path, notice: "Request declined" }
      f.json { render json: request, status: :ok }
    end
  end

  private

    def request_params
      params.require(:request).permit(:description, :teacher_id)
    end
end
