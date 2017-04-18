//= require comments

'use strict'

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// Show Lesson

//------------------------------------------------------------------------
// Lesson Class

function Lesson(attributes) {
  this.id = attributes.lesson.id
  this.title = attributes.lesson.title
  this.description = attributes.lesson.description
  this.content = attributes.lesson.content
  this.links = attributes.lesson.links
  this.created_at = Comment.format_date(new Date(attributes.lesson.created_at))
  this.category = attributes.lesson.category
  this.category_id = attributes.lesson.category_id // For index action
  this.author = attributes.lesson.author
  // this.author.avatar_url = location.protocol + '//' + location.host + "/" + this.author.avatar_url
  this.author_id = attributes.lesson.user_id // For index action
  this.can_update = attributes.lesson.can_update
  this.can_destroy = attributes.lesson.can_destroy
  this.next_id = attributes.lesson.next_id
  this.prev_id = attributes.lesson.prev_id

  if(attributes.lesson.comments) {
    this.comments = attributes.lesson.comments.reverse().map((comment) => new Comment({ comment: comment }))
  }
}

// Instance methods

Lesson.prototype.appendToPage = function() {
  const html = Lesson.template(this)
  const $wrapper = $(".lesson-container")

  if($wrapper.is(':visible')) $wrapper.hide()
  $(html).appendTo($wrapper)
  $wrapper.slideDown(1000)
}

// Class methods

Lesson.ready = function() {
  if($("#lesson-template").length <= 0) return;

  let source = $("#lesson-template").html()
  Lesson.template = Handlebars.compile(source)

  $(document).on("click", ".next-lesson", Lesson.loadNextLesson)
  $(document).on("click", ".prev-lesson", Lesson.loadPrevLesson)

  Lesson.loadLesson()
}

Lesson.loadLesson = function(url =  window.location.href) {
  $(".loader").show()
  $.ajax({
    url: url,
    type: "GET",
    dataType: "json"
  })
  .done(Lesson.successLoad)
  .fail(Lesson.failLoad)
  .always(() => { $(".loader").hide() })
}

Lesson.successLoad = function(json) {
  Lesson.currentLesson = new Lesson(json)

  $(".lesson-container").slideUp(1000, function() {
    $("article, #comments-section").remove()
    Lesson.currentLesson.appendToPage()
    Comment.appendToPage(Lesson.currentLesson)
  })
}

Lesson.failLoad = function(xhr) {
  let error
  switch(xhr.readyState) {
    case 0:
      error = "Network Error"
      break
    case 4:
      if(Math.floor((xhr.status/100)) === 5) { // Status Code 5**
        error = "Server Error"
      } else {
        error = xhr.responseText
      }
      break
    default:
      error = "Error occured"
  }

  $(".lesson-error").text(error)
}

Lesson.loadNextLesson = function(ev) {
  ev.preventDefault()

  const next_lesson = Lesson.currentLesson.next_id
  const author = Lesson.currentLesson.author.id

  if(next_lesson) {
    Lesson.loadLesson("/users/" + author + "/lessons/" + next_lesson)
    // history.pushState(null, null, window.location.href.slice(0, -1) + next_lesson)
  }
}

Lesson.loadPrevLesson = function(ev) {
  ev.preventDefault()

  const prev_lesson = Lesson.currentLesson.prev_id
  const author = Lesson.currentLesson.author.id

  if(prev_lesson) {
    Lesson.loadLesson("/users/" + author + "/lessons/" + prev_lesson)
    // history.pushState(null, null, window.location.href.slice(0, -1) + prev_lesson)
  }
}

//---------------------------------------------------
// Document ready.

$(document).ready(function() {
  Lesson.ready()
})


//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// Index Ation

Lesson.attachListenersIndex = function() {
  $(document).on("click", ".category-li", slideLessons)
}

function slideLessons() {
  $(this).find(".category-lessons").slideToggle()
}

Lesson.loadUserLessons = function(ev) {
  ev.preventDefault()
  $(".loader").show()
  $.ajax({
    url: $(this).attr("href"),
    type: "GET",
    dataType: "json"
  })
  .done(Lesson.successLoadUserLessons)
  .fail(Lesson.failLoadUserLessons)
  .always(() => { $(".loader").hide() })
}

Lesson.successLoadUserLessons = function(json) {
  let lessons_by_categories = {}, category

  for(category in json) {
    lessons_by_categories[category] = json[category].map((lesson) => new Lesson(lesson))
  }

  const html = Lesson.lessonByCategoriesTemplate(lessons_by_categories)
  $(".lessons-by-categories").empty()
  $(".lesson-by-categories-error").text("")
  $(html).appendTo($(".lessons-by-categories"))
}

Lesson.failLoadUserLessons = function(xhr) {
  let error
  switch(xhr.readyState) {
    case 0:
      error = "Network Error"
      break
    case 4:
      if(Math.floor((xhr.status/100)) === 5) { // Status Code 5**
        error = "Server Error"
      } else {
        error = xhr.responseText
      }
      break
    default:
      error = "Error occured"
  }

  $(".lesson-by-categories-error").text(error)
}

$(document).ready(function() {
  Lesson.attachListenersIndex()
})
