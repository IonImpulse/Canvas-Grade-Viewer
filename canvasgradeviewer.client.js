console.log("Canvas Grade Viewer loaded. Ha ha teachers.");
var assignments = document.getElementsByClassName("student_assignment assignment_graded editable");
console.log(assignments);
browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.command == "requestGrade") {
        var assignments = document.getElementsByClassName("student_assignment assignment_graded editable");
        console.log(assignments);
        }
    }
});
