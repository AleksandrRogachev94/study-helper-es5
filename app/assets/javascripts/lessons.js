//= require comments

'use strict'

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// Show Lesson

//------------------------------------------------------------------------
// Lesson Class

function Lesson(attributes) {
  var prop
  for(prop in attributes.lesson) {
    if(prop === "user_id") {
      this["author_id"] = attributes.lesson[prop]
    } else {
      this[prop] = attributes.lesson[prop]
    }
  }
  if(this.comments) {
    this.comments = this.comments.reverse().map(function(comment) { return new Comment({ comment: comment }) })
  }
}

// Instance methods

Lesson.prototype.appendToPage = function() {
  var html = Lesson.template(this)
  var $wrapper = $(".lesson-container")

  if($wrapper.is(':visible')) $wrapper.hide()
  $(html).appendTo($wrapper)
}

// Class methods

Lesson.ready = function() {
  if($("#lesson-template").length <= 0) return;

  var source = $("#lesson-template").html()
  Lesson.template = Handlebars.compile(source)

  $(document).on("click", ".next-lesson", Lesson.loadNextLesson)
  $(document).on("click", ".prev-lesson", Lesson.loadPrevLesson)

  Lesson.loadLesson()
}

Lesson.loadLesson = function(url) {
  url = (typeof url !== 'undefined') ?  url : window.location.href;
  $(".loader").show()
  $.ajax({
    url: url,
    type: "GET",
    dataType: "json"
  })
  .done(Lesson.successLoad)
  .fail(Lesson.failLoad)
  .always(function() { $(".loader").hide() })
}

Lesson.successLoad = function(json) {
  Lesson.currentLesson = new Lesson(json)

  $(".lesson-container").slideUp(850, function() {
    $("article, #comments-section").remove()
    Lesson.currentLesson.appendToPage()
    Comment.appendToPage(Lesson.currentLesson)
  })
}

Lesson.failLoad = function(xhr) {
  var error
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

  var next_lesson = Lesson.currentLesson.next_id
  var author = Lesson.currentLesson.author.id

  if(next_lesson) {
    Lesson.loadLesson("/users/" + author + "/lessons/" + next_lesson)
    // history.pushState(null, null, window.location.href.slice(0, -1) + next_lesson)
  }
}

Lesson.loadPrevLesson = function(ev) {
  ev.preventDefault()

  var prev_lesson = Lesson.currentLesson.prev_id
  var author = Lesson.currentLesson.author.id

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
  .always(function() { $(".loader").hide() })
}

Lesson.successLoadUserLessons = function(json) {
  var lessons_by_categories = {}, category

  for(category in json) {
    lessons_by_categories[category] = json[category].map(function(lesson) { return new Lesson(lesson) })
  }

  var html = Lesson.lessonByCategoriesTemplate(lessons_by_categories)
  $(".lessons-by-categories").empty()
  $(".lesson-by-categories-error").text("")
  $(html).appendTo($(".lessons-by-categories"))
}

Lesson.failLoadUserLessons = function(xhr) {
  var error
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

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// Create Action

Lesson.attachListenersCreate = function() {
  $(".new-category").hide()
  $(document).on("click", ".new-category-link", function(ev) {
    ev.preventDefault()
    $(this).hide()
    $(".new-category").show()
  })
}

//%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
// Document Ready

$(document).ready(function() {
  Lesson.attachListenersIndex()
  Lesson.attachListenersCreate()
})
