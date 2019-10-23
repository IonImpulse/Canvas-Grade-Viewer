document.addEventListener('DOMContentLoaded', function() {
    function checkZeroConvert(stringNum) {
      if (stringNum == "") {
          stringNum = 0.0;
      } else {
          stringNum = parseFloat(stringNum);
      }
      return stringNum
    }

    function isolateWeight(weightString) {
      
    }
    var assignmentsList = document.getElementsByClassName("student_assignment editable");
    var grades = [];
    var gradeMaxes = [];
    var gradeTypes = [];

    console.log(assignmentsList[0].innerHTML.split("\n"));

    for (var i = 0; i < assignmentsList.length; i++) {
        var tempAssignment = assignmentsList[i].innerHTML.split("\n");
        var lengthInner = tempAssignment.length;

        grades.push(checkZeroConvert(tempAssignment[lengthInner-56].replace(/\s/g,'')));

        gradeMaxes.push(checkZeroConvert(tempAssignment[lengthInner-31].replace(/\s/g,'')));

        gradeTypes.push(tempAssignment[4]);
    }

    console.log(grades);
    console.log(gradeMaxes);
    console.log(gradeTypes);
}, false);
