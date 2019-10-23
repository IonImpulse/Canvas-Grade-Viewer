document.addEventListener('DOMContentLoaded', function() {
    function checkZeroConvert(stringNum) {
      if (stringNum == "") {
          stringNum = 0.0;
      } else {
          stringNum = parseFloat(stringNum);
      }
      return stringNum
    }
    var assignmentsList = document.getElementsByClassName("student_assignment editable");
    var grades = [];
    var gradeMaxes = [];
    var gradeTypes = [];
    console.log(assignmentsList[0]);
    for (var i = 0; i < assignmentsList.length; i++) {
        var tempAssignment = assignmentsList[i].innerHTML.split("\n");
        var lengthInner = tempAssignment.length;

        grades.push(checkZeroConvert(tempAssignment[lengthInner-56].replace(/\s/g,'')));

        gradeMaxes.push(checkZeroConvert(tempAssignment[lengthInner-31].replace(/\s/g,'')));

    }
    console.log(grades);
    console.log(gradeMaxes);
}, false);
