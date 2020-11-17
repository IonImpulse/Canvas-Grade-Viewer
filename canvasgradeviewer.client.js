function gradeCheck() {
    function getBrowser() {
        if( navigator.userAgent.indexOf("Chrome") != -1 ) {
          return "Chrome";
        } else if( navigator.userAgent.indexOf("Opera") != -1 ) {
          return "Opera";
        } else if( navigator.userAgent.indexOf("MSIE") != -1 ) {
          return "IE";
        } else if( navigator.userAgent.indexOf("Firefox") != -1 ) {
          return "Firefox";
        } else {
          return "unknown";
        }
    }

    var line_to_get_env = 88;

    if (getBrowser() == "Chrome") {
        line_to_get_env = 37
    }

    var gradeOutput = document.getElementById("student-grades-final");
    gradeOutput.innerText = "Error Loading ENV variable! Refresh page to display grade...";

    var env_string = document.documentElement.innerHTML.split("\n")[line_to_get_env].trim();
    console.log("loading eval string...");

    eval("var " + env_string);

    function sum(array) {
        var to_return = 0;
        for (i of array) {
            to_return += i;
        }
        return to_return;
    }

    function isolateWeight(weightString) {
        weightString = weightString.slice(weightString.indexOf(">") + 1, weightString.indexOf("<", weightString.indexOf(">")));
        return weightString;
    }
    
    function find_grade_max_type(inputAssignment) {
        // Section to get grade/what-if grade, max, type, and weight id
        // What-if grade is always set to the original grade, so we can just grab that

        // Get weight ID
        const id_html = inputAssignment.getElementsByClassName("assignment_id")[0].innerText;
        var id = id_html.trim();

        // Get what-if score
        const whatif_points_html = inputAssignment.getElementsByClassName("what_if_score")[0].innerText;
        var whatif_points = parseFloat(whatif_points_html.replace(",", ""));

        // Get the maximun points possible per assignment
        const maximum_points_html = inputAssignment.getElementsByClassName("possible points_possible")[0].innerText;
        var maximum_points = parseFloat(maximum_points_html.replace(",", ""));

        // Get what group/weight grade it is in
        const type_html = inputAssignment.getElementsByClassName("context")[0].innerText;
        var type = type_html.trim();
        
        // Get weight ID
        const weight_id_html = inputAssignment.getElementsByClassName("assignment_group_id")[0].innerText;
        var weight_id = weight_id_html.trim();

        var assignment_to_return = {
            id: id,
            grade: whatif_points,
            max: maximum_points,
            group_id: weight_id
        }

        return(assignment_to_return);
    }

    function get_grade(assignments, weightsExist) {
        if (weightsExist == false) {
            let total_grade = 0;
            let totalMax = 0;
            for (assignment of assignments) {
                total_grade = total_grade + assignment.grade;
                totalMax = totalMax + assignment.max;
            }
    
            if (total_grade == 0) {
                total_grade = "N/A";
            } else {
                total_grade = total_grade/totalMax*100;
            }
            
            const to_return = {
                total_grade: total_grade,
                all_group_grades: null,
                all_group_maxes: null
            };

            return to_return;

        } else {
            let total_grade = 0;
            var current_group = {
                group_ids: [],
                group_weights: [],
                group_grades: [],
                group_maxes: []
                
            };
            
            for (assignment of assignments) {
                if (current_group.group_ids.indexOf(assignment.group_id) == -1) {
                    current_group.group_ids.push(assignment.group_id);
                    current_group.group_grades.push(0);
                    current_group.group_maxes.push(0);
                    
                    for (a_group of ENV["assignment_groups"]) {
                        
                        if (a_group.id == assignment.group_id) {
                            current_group.group_weights.push(a_group.group_weight);
                        }
                    }
                }
                
                const a_index = current_group.group_ids.indexOf(assignment.group_id);
                    
                current_group.group_grades[a_index] += assignment.grade;
                current_group.group_maxes[a_index] += assignment.max;
            }

            if (sum(current_group.group_weights) == 0) {
                total_grade = 100*sum(current_group.group_grades)/sum(current_group.group_maxes);

            } else {
                for (index in current_group.group_maxes) {
                    if (current_group.group_maxes[index] != 0) {
                        total_grade = total_grade + (current_group.group_grades[index]/current_group.group_maxes[index] * (current_group.group_weights[index]/100) * 100);
                    }
                  }
                  
                  if (sum(current_group.group_weights) != 100) {
                      total_grade = total_grade * (100/sum(current_group.group_weights));
                  } 
            }

            const to_return = {
                total_grade: total_grade,
                all_group_grades: current_group.group_grades,
                all_group_maxes: current_group.group_maxes,
                all_group_weights: current_group.group_weights,
                all_group_ids: current_group.group_ids
            };
            
            return to_return;

        }
    }
    

    var assignmentsList = document.getElementsByClassName("student_assignment editable");

    var assignments_list = [];

    for (var i = 0; i < assignmentsList.length; i++) {
        var tempAssignment = assignmentsList[i].innerHTML.split("\n");
        
        var retrivied = find_grade_max_type(assignmentsList[i]);
        
        if (retrivied.grade != "" && isNaN(retrivied.grade) == false) {
            assignments_list.push(retrivied);
        }
    }

    var grading_period_is_all = false;
    var weightsExist = false;

    if (ENV.group_weighting_scheme == "percent") {
        weightsExist = true;
    }

    if (ENV.grading_periods != null && ENV.current_grading_period_id == 0) {
        grading_period_is_all = true;
    }

    var total_grade = 0;
    var all_grades = [];
    var all_grade_maxes = [];
    var all_group_ids = [];
    var all_group_grades = [];
    var all_group_maxes = [];
    var all_group_ids = [];

    var user_id = ENV.current_user.id;

    if (grading_period_is_all == true) {
        
        var periods = [];
        for (period of ENV.grading_periods) {
            var temp_assignments = [];

            for (assignment of assignments_list) {                
                if (ENV["effective_due_dates"][assignment.id][user_id]["grading_period_id"] == period.id) {
                    temp_assignments.push(assignment);
                }
            }

            periods.push(get_grade(temp_assignments, weightsExist));
        }
        
        let period_weight_sum = 0;

        for (i in periods) {
            all_group_grades = all_group_grades.concat(periods[i].all_group_grades);
            all_group_maxes = all_group_maxes.concat(periods[i].all_group_maxes);
            all_group_ids = all_group_ids.concat(periods[i].all_group_ids);

            if (isNaN(periods[i].total_grade) == false) {
                total_grade += (ENV["grading_periods"][i]["weight"]/100) * periods[i].total_grade;
                period_weight_sum += ENV["grading_periods"][i]["weight"];
            }
        }

        if (period_weight_sum != 100) {
            total_grade = total_grade * (100/period_weight_sum);
        }

    } else {
        var periods = [get_grade(assignments_list, weightsExist)];
        total_grade = periods[0].total_grade;
        all_group_grades = all_group_grades.concat(periods[0].all_group_grades);
        all_group_maxes = all_group_maxes.concat(periods[0].all_group_maxes);
        all_group_ids = all_group_ids.concat(periods[0].all_group_ids);
    }

    for (assignment of assignments_list) {
        all_grades.push(assignment.grade);
        all_grade_maxes.push(assignment.max);
    }

    // Debug string creation START 

    let debug_string = "";

    debug_string += "Grades:\n";

    for (grade of all_grades) {
        debug_string += `|${grade.toString().slice(0,5).padEnd(5)} `;
    }

    debug_string += "|\n";

    for (grade of all_grade_maxes) {
        debug_string += `|${grade.toString().slice(0,5).padEnd(5)} `;
    }

    debug_string += "|\n\n";

    if (weightsExist == true) {
        debug_string += "Group Grades:\n";

        for (grade of all_group_grades) {
            debug_string += `|${grade.toString().slice(0,7).padEnd(7)} `;
        }

        debug_string += "|\n";
        
        for (grade of all_group_maxes) {
            debug_string += `|${grade.toString().slice(0,7).padEnd(7)} `;
        }

        debug_string += "|\n\n";
    }

    debug_string += `Total Grade: ${total_grade}`;

    console.log(debug_string);
    
   // Debug string creation END

    // Put the now-known grades in the HTML
    // YAY it's here!
    var gradeOutput = document.getElementById("student-grades-final");
    gradeOutput.innerText = `Total: ${total_grade.toString().slice(0, 5)}%`;

    if (weightsExist == true && grading_period_is_all == false) {
        for (var i = 0; i < all_group_ids.length; i++) {
            const section_html = document.getElementById(`submission_group-${[all_group_ids[i]]}`);

            var section = section_html.innerHTML.split("\n");
            grade_to_insert = (100*all_group_grades[i]/all_group_maxes[i]).toString().slice(0,5);
            
            string_to_insert = `${all_group_grades[i]}/${all_group_maxes[i]} (${grade_to_insert}%)`;
            
            section[18] = " ";
            section[19] = " ";
            section[20] = " ";

            section[22] = string_to_insert;

            section_html.innerHTML = section.join("\n");
            
        }

    }
    
}

var ENV;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
 }
async function WaitForGrade() {
    await sleep(200);
    gradeCheck();        
}

document.addEventListener('DOMContentLoaded', function() {   
    gradeCheck();        
}, false);

document.addEventListener('mouseup', function() {
    
    WaitForGrade();
}, false);

document.addEventListener('keydown', function(e) {
    if(e.keyCode == 13) {
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
         }
        async function WaitForGrade() {
            await sleep(200);
            gradeCheck();            
        }
        WaitForGrade();
    }
}, false);