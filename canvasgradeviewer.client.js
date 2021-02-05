function getStorageData(key) {
    return new Promise((resolve, reject) => chrome.storage.local.get(key, result => chrome.runtime.lastError
        ? reject(Error(chrome.runtime.lastError.message))
        : resolve(result)
    )
    )
}

function setStorageData(data) {
    return new Promise((resolve, reject) => chrome.storage.local.set(data, () => chrome.runtime.lastError
        ? reject(Error(chrome.runtime.lastError.message))
        : resolve()
    )
    )
}

function isEmpty(obj) { 
    for (var x in obj) { return false; }
    return true;
}

async function addToGPA(input_grade) {    
    console.log("adding to gpa...", input_grade);

    const sub_domain = window.location.hostname.split(".")[0];
    const page_number = window.location.pathname.split("/")[2];
    const grade = input_grade;
    const title = document.title.split(":")[1];

    console.log(sub_domain);
    
    var current_info = {};
    try {
        current_info = await getStorageData("canvas_grade_viewer_data");
        current_info = current_info.canvas_grade_viewer_data;
    } catch (error) {
        
    }

    console.log("Loaded:", current_info);

    // Case 1:
    // Not yet set up, nothing in local storage
    if (isEmpty(current_info)) {
        console.log("Case 1", sub_domain);
        
        console.log(grade);
        const to_set = {
            sub_domains: [{ name: sub_domain,
                            pages: {page_names: [title.trim()],
                                    page_numbers: [page_number],
                                    grades: [grade],
                                    credits: [1]}}]
        };
        
        console.log(to_set);

        current_info = to_set;

    }

    var index_of_subdomain = -1;
    for (i in current_info.sub_domains) {
        if (current_info.sub_domains[i].name == sub_domain) {
            index_of_subdomain = i;
        }
    }

    if (index_of_subdomain == -1) {
        // Case 2:
        // Has been set up, but not this subdomain. Would take effect if there were multiple schools that use canvas
        console.log("Case 2");
        current_info.sub_domains.push({name: sub_domain, pages: {page_names: [title.trim()], page_numbers: [page_number], grades: [grade], credits: [1]}})
        index_of_subdomain = current_info.sub_domains.length - 1;
    }

    // Case 3:
    // Has been set up w/ subdomain, but this page has not been added yet
    if (!current_info.sub_domains[index_of_subdomain].pages.page_numbers.includes(page_number)) {
        console.log("Case 3");
        current_info.sub_domains[index_of_subdomain].pages.page_names.push(title.trim());
        current_info.sub_domains[index_of_subdomain].pages.page_numbers.push(page_number);
        current_info.sub_domains[index_of_subdomain].pages.grades.push(grade);
        current_info.sub_domains[index_of_subdomain].pages.credits.push(1);
    } else {
        // Case 4:
        // Has been set up and page has been added, so just update the grade
        console.log("Case 4");
        const index_of_page = current_info.sub_domains[index_of_subdomain].pages.page_numbers.indexOf(page_number);
        current_info.sub_domains[index_of_subdomain].pages.grades[index_of_page] = grade;
    }

    console.log(current_info);

    // Finally, only have one time where it is updated to increase
    await setStorageData({"canvas_grade_viewer_data": current_info});

}

async function addToGPAButton() {
    await addToGPA(await gradeCheck());
}

async function gradeCheck() {
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

    var line_to_get_env = 88; //88

    if (getBrowser() == "Chrome") {
        line_to_get_env = 37;
    }

    var gradeOutput = document.getElementById("student-grades-final");
    var rightSidebar = document.getElementById("student-grades-right-content");

    if (gradeOutput == null) {
        gradeOutput = rightSidebar.getElementsByClassName("student_assignment final_grade")[0];
    }

    gradeOutput.innerText = "Error Loading ENV variable! Refresh page to display grade...";

    const page_html = document.documentElement.innerHTML.split("\n");

    var env_string = page_html[line_to_get_env].trim();

    console.log("loading eval string...", env_string.substring(0,3));

    if (env_string.substring(0,3) != "ENV") {
        console.log("Could not get ENV string, searching...");
        
        var temp_line = 0;

        while (page_html[temp_line].trim().substring(0,3) == "ENV" ^ temp_line < 210) {
            temp_line++;
        }

        if (page_html[temp_line].trim().substring(0,3) != "ENV") {
            throw "No ENV variable to load...";
        } else {
            console.log("Found ENV variable!", temp_line);
            env_string = page_html[temp_line].trim();
        }
        
    }

    eval("var " + env_string);

    function sum(array) {
        var to_return = 0;
        for (i of array) {
            to_return += i;
        }
        return to_return;
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
            
            let return_grade;

            if (total_grade == 0) {
                return_grade = "N/A";
            } else {
                return_grade = total_grade/totalMax*100;
            }
            
            const to_return = {
                total_grade: return_grade,
                all_group_grades: [total_grade],
                all_group_maxes: [totalMax]
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
        }
        
        if (ENV["grading_periods"][0]["weight"] == null) {
            total_grade = 100*(sum(all_group_grades)/sum(all_group_maxes));
        } else {
            for (i in periods) {
                if (isNaN(periods[i].total_grade) == false) {
                    total_grade += (ENV["grading_periods"][i]["weight"]/100) * periods[i].total_grade;
                    period_weight_sum += ENV["grading_periods"][i]["weight"];
                }
            }

            if (period_weight_sum != 100 || period_weight_sum != 0) {
                total_grade = total_grade * (100/period_weight_sum);
            }
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

    // Put the now-known grades and GPA button in the HTML
    // YAY it's here!

    gradeOutput.innerHTML = `Total: ${total_grade.toString().slice(0, 5)}%<br><button class="fOyUs_bGBk eHiXd_bGBk eHiXd_bXiG eHiXd_ycrn eHiXd_bNlk eHiXd_cuTS" id="add-to-gpa" type="button">Add To GPA</button>`;

    document.getElementById("add-to-gpa").addEventListener("click", addToGPAButton);    
    
    if (weightsExist == true && grading_period_is_all == false) {
        for (var i = 0; i < all_group_ids.length; i++) {
            const section_html = document.getElementById(`submission_group-${[all_group_ids[i]]}`);

            grade_to_insert = (100*all_group_grades[i]/all_group_maxes[i]).toString().slice(0,5);
            
            string_to_insert = `${all_group_grades[i]}/${all_group_maxes[i]}`;

            section_html.getElementsByClassName("assignment_score")[0].innerText = `${grade_to_insert}%`;
            section_html.getElementsByClassName("possible points_possible")[0].innerText = string_to_insert;
        }

    }

    console.log("updating gpa??");

    let current_info = await getStorageData("canvas_grade_viewer_data");
    
    if (isEmpty(current_info) == false) {
        console.log(current_info.canvas_grade_viewer_data);
        if (current_info.canvas_grade_viewer_data != {}) {
            current_info = current_info.canvas_grade_viewer_data;
            const sub_domain = window.location.hostname.split(".")[0];
            const page_number = window.location.pathname.split("/")[2];
        
            console.log(sub_domain, page_number);
        
            let in_gpa = -1;
            for (i in current_info.sub_domains) {
                if (current_info.sub_domains[i].name == sub_domain) {
                    in_gpa = i;
                }
            }
            
            console.log(in_gpa);

            if (in_gpa != -1) {
                const in_gpa_page = current_info.sub_domains[in_gpa].pages.page_numbers.indexOf(page_number);
                
                if (in_gpa_page != -1) {
                    console.log("updating...");
                    await addToGPA(total_grade);
                }
            }
        }
    }
    
    
    return total_grade;
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
    if(e.key == "Enter") {
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
