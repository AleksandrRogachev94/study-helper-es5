//= require lessons

$(document).ready(function() {

  if($("#lessons-by-categories-template").length <= 0) return;

  let source = $("#lessons-by-categories-template").html()
  Lesson.lessonByCategoriesTemplate = Handlebars.compile(source)

  $("#user-lessons").on("click", Lesson.loadUserLessons)
})
