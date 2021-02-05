function add_row() {
 var new_name=document.getElementById("new_name").value;
 var new_country=document.getElementById("new_country").value;
 var new_age=document.getElementById("new_age").value;
	
 var table=document.getElementById("data_table");
 var table_len=(table.rows.length)-1;
 var row = table.insertRow(table_len).outerHTML="<tr id='row"+table_len+"'><td id='name_row"+table_len+"'>"+new_name+"</td><td id='country_row"+table_len+"'>"+new_country+"</td><td id='age_row"+table_len+"'>"+new_age+"</td><td><input type='button' id='edit_button"+table_len+"' value='Edit' class='edit' onclick='edit_row("+table_len+")'> <input type='button' id='save_button"+table_len+"' value='Save' class='save' onclick='save_row("+table_len+")'> <input type='button' value='Delete' class='delete' onclick='delete_row("+table_len+")'></td></tr>";

 document.getElementById("new_name").value="";
 document.getElementById("new_country").value="";
 document.getElementById("new_age").value="";
}

function isEmpty(obj) { 
    for (var x in obj) { return false; }
    return true;
}

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

function sum(array) {
    var to_return = 0;
    for (i of array) {
        to_return += i;
    }
    return to_return;
}

async function delete_row() {   
    let id = this.id.split("-");

    console.log(`Deleting row: ${this.id}`);
    
    let current_data = await getStorageData("canvas_grade_viewer_data");
    current_data = current_data.canvas_grade_viewer_data;
    
    const school = parseInt(id[1]);
    const subject = parseInt(id[3]);
    console.log(current_data.sub_domains[school].pages.page_names.length);
    if (current_data.sub_domains[school].pages.page_names.length == 1) {
        current_data.sub_domains.splice(school, 1);
    } else {
        current_data.sub_domains[school].pages.page_names.splice(subject, 1);
        current_data.sub_domains[school].pages.page_numbers.splice(subject, 1);
        current_data.sub_domains[school].pages.grades.splice(subject, 1);
        current_data.sub_domains[school].pages.credits.splice(subject, 1);
    }
    

    await setStorageData({"canvas_grade_viewer_data": current_data});
    set_table();
    set_gpa();
}

function get_gpa(grade) {
    if (grade < 0) { return null; }
    
    const percent_cuts = [93, 90, 87, 83, 80, 77, 73, 70, 67, 63, 61, 0];
    const gpa_cuts = [4, 3.7, 3.3, 3.0, 2.7, 2.3, 2.0, 1.7, 1.3, 1.0, 0.0];

    for (i in percent_cuts) {
        if (grade >= percent_cuts[i]) {
            return gpa_cuts[i];
        }
    }
}


// Weighted GPA calculations
async function set_gpa() {
    console.log("Setting gpa...");
    let current_data = await getStorageData("canvas_grade_viewer_data");
    current_data = current_data.canvas_grade_viewer_data;
    
    let gpa_list = [];

    for (school in current_data.sub_domains) {
        let temp_gpa_list = [];
        
        for (grade in current_data.sub_domains[school].pages.grades) {
            temp_gpa_list.push(get_gpa(current_data.sub_domains[school].pages.grades[grade]) * current_data.sub_domains[school].pages.credits[grade]);
        }
        
        console.log(temp_gpa_list, current_data.sub_domains[school].pages.credits);
        
        gpa_list.push(sum(temp_gpa_list)/sum(current_data.sub_domains[school].pages.credits));
        
        console.log(gpa_list[school],`${school}-GPA-location`);

        document.getElementById(`${current_data.sub_domains[school].name}-GPA-location`).innerText = `GPA: ${gpa_list[school].toString().slice(0, 4)}`;
    }
}

async function clearStorageData() {
    console.log("Clearing data...");
    await setStorageData({"canvas_grade_viewer_data": {}});
    document.getElementById("grades").innerHTML = "";
    console.log("Cleared!");
}

async function update_credit() {
    console.log("Changing credit...");
    const try_value = parseFloat(document.getElementById(`${this.id}`).value);

    console.log(try_value);

    if (try_value != NaN) {
        if (try_value > 0) {
            let current_data = await getStorageData("canvas_grade_viewer_data");
            current_data = current_data.canvas_grade_viewer_data;

            const school_index = parseInt(this.id.split("-")[2]);
            const subject_index = parseInt(this.id.split("-")[4]);

            console.log("Changing credit to", try_value);
            current_data.sub_domains[school_index].pages.credits[subject_index] = try_value;

            await setStorageData({"canvas_grade_viewer_data": current_data});

            set_gpa();
        }
    }
}

document.getElementById("clear-data").addEventListener("click", clearStorageData);

console.log("Creating GPA table...");

async function set_table() {
    var grade_div = document.getElementById("grades");

    console.log(grade_div);

    const grades_temp = await getStorageData("canvas_grade_viewer_data");
    const grades = grades_temp.canvas_grade_viewer_data;

    console.log(grades);

    grade_div.innerHTML = "";

    if (grades) {
        for (var school = 0; school < grades.sub_domains.length; school++) {
            const school_name = grades.sub_domains[school].name;

            let output = `<table id="${grades.sub_domains[school].name}">
                            <thead>
                                <tr>
                                    <th colspan="4">${grades.sub_domains[school].name}</th>
                                </tr>
                            </thead>
                            <tbody>
                            <tr class="grade-header">
                                <td>Grade</td>
                                <td>Class</td>
                                <td>Credits</td>
                                <td>Delete</td>
                            </tr>
                            
                            `;

            for (var subject = 0; subject < grades.sub_domains[school].pages.grades.length; subject++) {
                const grade_url = `https://${grades.sub_domains[school].name}.instructure.com/courses/${grades.sub_domains[school].pages.page_numbers[subject]}/grades`;
                
                output += `<tr id="${school}-row-${subject}">
                            <td class="row-grade">${grades.sub_domains[school].pages.grades[subject].toString().slice(0, 5)}%</td>
                            <td class="row-name">
                                <a href="${grade_url}" target="_blank">${grades.sub_domains[school].pages.page_names[subject]}</a>                            
                            </td>
                            <td class="row-credit">
                                    <input type="number" class="input-credit" id="credit-input-${school}-row-${subject}" step=".01" value="${grades.sub_domains[school].pages.credits[subject]}">
                            </td>
                            <td class="row-delete"><div class="delete" id="del-${school}-row-${subject}">X</div></td>
                           </tr>\n`;
            }

            output += `<thead>
                            <tr>
                                <th id="${school_name}-GPA-location" colspan="4">GPA: Error</th>
                            </tr>
                        </thead>
            
                        </tbody>
                       </table>`;

            grade_div.innerHTML += output;

            for (var subject = 0; subject < grades.sub_domains[school].pages.grades.length; subject++) {
                document.getElementById(`del-${school}-row-${subject}`).addEventListener("click", delete_row);
                document.getElementById(`credit-input-${school}-row-${subject}`).addEventListener("input", update_credit);
            }
        }
    }
}

set_table();
console.log("Created GPA table!");
set_gpa();
console.log("Calculated GPA!");
