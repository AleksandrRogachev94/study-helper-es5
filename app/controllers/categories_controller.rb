class CategoriesController < ApplicationController
  before_action :authenticate_user!

  def index
    @categories = Category.all
  end

  def show
    @category = Category.find_by(id: params[:id])
    return redirect_to categories_path, alert: "Category doesn't exist" if !@category
    @users = @category.users.uniq
  end
end
