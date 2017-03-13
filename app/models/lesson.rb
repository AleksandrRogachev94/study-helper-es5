class Lesson < ApplicationRecord
  belongs_to :category
  belongs_to :user

  before_save :make_capitalized

  validates :title, presence: true
  validates :content, presence: true, length: { minimum: 30 }

  def category_attributes=(attrs)
    if attrs[:title].present?
      category = Category.where("lower(title) = ?", attrs[:title]).first_or_create(title: attrs[:title])
      self.category = category
      self.save
    end
  end

  def make_capitalized
    self.title.capitalize!
  end
end
