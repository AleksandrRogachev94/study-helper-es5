class StudyshipsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_user, only: [:index, :create]

  # actually index is authorized too.
  after_action :verify_authorized, only: [:create, :destroy]

  # Stub is needed to authorize index action
  def index
    case params[:rel_type]
    when "students"
      studyship_stub = @user.teacher_student_relationships.build
      @studyships = @user.teacher_student_relationships.reload
    when "teachers"
      studyship_stub = @user.student_teacher_relationships.build
      @studyships = @user.student_teacher_relationships.reload
    else
      return redirect_to root_path, alert: "Relationships must be '/students' or '/teachers'"
    end

    authorize studyship_stub
    @rel_type = params[:rel_type].singularize
  end

  def create
    authorize Studyship

    request = Request.find_by(id: params[:request_id])
    # If someone wants to hack by url, the only thing he can do is to grant acces to other users to his data.
    if request && Studyship.establish_mutual_relationships(teacher: @current_user, student: @user)
      request.delete
      redirect_to requests_path, notice: "Request confirmed"
    else
      redirect_to (:back), alert: "Can't establish relationship"
    end
  end

  def destroy
    if params[:rel_type] != "students" && params[:rel_type] != "teachers"
      flash[:alert] = "Relationships must be '/students' or '/teachers'"
      redirect_to(:back)
    else
      studyship = Studyship.find_by(id: params[:id])
      authorize studyship
      studyship.delete
      redirect_to user_studyships_path(current_user, params[:rel_type]), notice: "Successfully deleted #{params[:rel_type].singularize}"
    end
  end

  private

    def set_user
      @user = User.find_by(id: params[:user_id])
      return redirect_to root_path, alert: "User doesn't exist" if !@user
    end
end