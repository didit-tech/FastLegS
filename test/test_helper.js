var assert = global.assert = require('assert');
var inspect = require('eyes').inspector({ maxLength: 1000000 });

/**
 * Terminate process on uncaught exception
 */

process.on('uncaughtException', function(err) {
  console.dir(err);
  process.exit(1);
});

module.exports = function(FastLegS) {
  var posts = [
    { id: 1, title: 'Some Title 1', blurb: 'Some blurb 1',
      body: 'Some body 1', published: false },
    { id: 2, title: 'Some Title 2',
      body: 'Some body 2', published: true },
    { id: 3, title: 'Some Title 3', blurb: 'Some blurb 3',
      body: 'Some body 3', published: true },
    { id: 4, title: '\'lol\\"', blurb: 'Extra\'"\\"\'\'--',
      body: '"""--\\\'"', published: false }
  ]

  var comments = [
    { id: 1, post_id: 1, comment: 'Comment 1', created_at: new Date() },
    { id: 2, post_id: 1, comment: 'Comment 2', created_at: new Date() },
    { id: 3, post_id: 2, comment: 'Comment 3', created_at: new Date() },
    { id: 4, post_id: 2, comment: 'Comment 4', created_at: new Date() },
    { id: 5, post_id: 3, comment: 'Comment 5', created_at: new Date() },
    { id: 6, post_id: 3, comment: 'Comment 6', created_at: new Date() },
    { id: 7, post_id: 4, comment: 'Comment 7', created_at: new Date() },
    { id: 8, post_id: 4, comment: 'Comment 8', created_at: new Date() }
  ]

  var Comment = FastLegS.Base.extend({
    tableName: 'comments',
    primaryKey: 'id'
  });

  var Post = FastLegS.Base.extend({
    tableName: 'posts',
    primaryKey: 'id',
    many: [
      { 'comments': Comment, joinOn: 'post_id' }
    ]
  });

  var students = [
    { id: 1, name: 'Abe' },
    { id: 2, name: 'Ben' },
    { id: 3, name: 'Christine' },
    { id: 4, name: 'Delia' },
    { id: 5, name: 'Egwene' }
  ]

  var professors = [
    { id: 6, name: 'Felix' },
    { id: 7, name: 'Garret' },
    { id: 8, name: 'Horton' },
    { id: 9, name: 'Irene' },
    { id: 10, name: 'Jane' }
  ]

  var student_professor = [
    { student_id: 1, professor_id: 6 },
    { student_id: 2, professor_id: 6 },
    { student_id: 3, professor_id: 7 },
    { student_id: 4, professor_id: 7 },
    { student_id: 5, professor_id: 8 },
    { student_id: 1, professor_id: 8 },
    { student_id: 2, professor_id: 9 },
    { student_id: 3, professor_id: 9 },
    { student_id: 4, professor_id: 10 },
    { student_id: 5, professor_id: 10 }
  ]

  var Student = FastLegS.Base.extend({
    tableName: 'students',
    primaryKey: 'id',
  });

  var Professor = FastLegS.Base.extend({
    tableName: 'professors',
    primaryKey: 'id',
  })

  var StudentProfessor = FastLegS.Base.extend({
    tableName: 'student_professor',
    foreignKeys: [
       { model: Student, key: 'student_id' },
       { model: Professor, key: 'professor_id' }
    ]
  })

  Student.many = [{
    professors: Professor,
    assoc: StudentProfessor
  }]

  Professor.many = [{
    students: Student,
    assoc: StudentProfessor
  }]

  return {
    posts: posts,
    comments: comments,
    Post: Post,
    Comment: Comment,

    students: students,
    professors: professors,
    student_professor: student_professor,
    Student: Student,
    Professor: Professor,
    StudentProfessor: StudentProfessor
  }
}
