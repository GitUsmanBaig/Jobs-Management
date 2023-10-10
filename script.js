let selectedFilters = [];

function createJobListing(job) {
    let tagsHTML = '';

    // Add the job's level to the tags
    if (job.level) {
        tagsHTML += `<span class="tag" onclick="addFilter('${job.level}')">${job.level}</span>`;
    }

    // Add the job's languages to the tags
    if (job.languages) {
        tagsHTML += job.languages.map(lang => `<span class="tag" onclick="addFilter('${lang}')">${lang}</span>`).join(' ');
    }

    // Add the job's tools to the tags
    if (job.tools) {
        tagsHTML += job.tools.map(tool => `<span class="tag" onclick="addFilter('${tool}')">${tool}</span>`).join(' ');
    }

    return `<div class="job-listing" id="hello" data-jobId="${job.id}">
                <img src="${job.logo}" alt="${job.company} logo" class="job-logo">
                <div class="job-info">
                    <div>
                        <span class="job-company">${job.company}</span>
                        ${job.new ? '<span class="job-new">NEW!</span>' : ''}
                        ${job.featured ? '<span class="job-featured">FEATURED</span>' : ''}
                    </div>
                    <h3 class="job-title" onclick="showModal('${job.id}')">${job.position}</h3>
                    <div class="job-details">
                        <span>${job.postedAt}</span>
                        <span>${job.contract}</span>
                        <span>${job.location}</span>
                    </div>
                </div>
                <div class="job-tags">${tagsHTML}</div>
            </div>`;
}


function addFilter(tag) {
    // Add tag to filters if it's not there
    if (!selectedFilters.includes(tag)) {
        selectedFilters.push(tag);
    }
    displaySelectedFilters();
    loadAllJobs();
}

//remove all filter
function removeAllFilter() {
    selectedFilters = [];
    displaySelectedFilters();
    loadAllJobs();
}



function displaySelectedFilters() {
    let filtersHTML = selectedFilters.map(filter => `
<div class="filter-item">
    ${filter}
    <span onclick="removeFilter('${filter}')">x</span>
</div>
`).join('');

    if (selectedFilters.length > 0) {
        filtersHTML += '<button id="clearAllFilters">Clear</button>';
    }

    $('#filters').html(filtersHTML);
    if (selectedFilters.length > 0) {
        $('#filters').show();
    } else {
        $('#filters').hide();
    }
}

function removeFilter(tag) {
    selectedFilters = selectedFilters.filter(filter => filter !== tag);
    displaySelectedFilters();
    loadAllJobs();
}

function loadAllJobs() {
    $.getJSON("data.json", function (data) {
        let jobsHTML = '';
        let filteredJobs = data.filter(job => {
            let jobTags = [job.level, ...(job.languages || []), ...(job.tools || [])];
            return selectedFilters.every(filter => jobTags.includes(filter));
        });
        filteredJobs.forEach(job => {
            jobsHTML += createJobListing(job);
        });
        $('#job-listings').html(jobsHTML);
    });
}



function closeModal() {
    $('#jobModal').hide();
}


function showAddJobModal() {
    $('#addJobModal').show();
}

function closeAddJobModal() {
    $('#addJobModal').hide();
}



$(document).ready(function () {
    $.getJSON("data.json", function (data) {
        let jobsHTML = data.map(createJobListing).join('');
        $('#job-listings').append(jobsHTML);
    });


    // Event listener for the add job form submission
    $("#addJobForm").submit(function (e) {
        e.preventDefault();

        let selectedLanguages = [];
        $("input[name='languages']:checked").each(function () {
            selectedLanguages.push($(this).val());
        });

        let selectedTools = [];
        $("input[name='tools']:checked").each(function () {
            selectedTools.push($(this).val());
        });

        const newJob = {
            id: new Date().getTime(),
            company: $("#companyName").val(),
            position: $("#jobPosition").val(),
            location: $("#jobLocation").val(),
            contract: $("#jobContract").val(),
            postedAt: new Date().toLocaleDateString(),
            new: true,
            level: $("input[name='level']:checked").val(),
            languages: selectedLanguages,
            tools: selectedTools,
            featured: $("#isFeatured").is(":checked"),
            logo: $("#jobLogoUrl").val()
        };

        $('#job-listings').prepend(createJobListing(newJob));
        this.reset();
        closeAddJobModal();
    });


});

function deleteJob(jobId) {
    // Remove the job listing with the matching jobId
    $(`[data-jobId="${jobId}"]`).remove();

    // Hide the modal
    $('#jobModal').hide();
}

$(document).on('click', '#deleteJobBtn', function () {
    const jobId = $(this).attr('data-jobId');
    deleteJob(jobId);
});



$('#addBtn').click(function () {
    showAddJobModal();
});

$(document).on('click', '#clearAllFilters', function () {
    removeAllFilter();
});


function showModal(jobId) {
    $.getJSON("data.json", function (data) {
        const job = data.find(j => j.id == jobId);
        if (job) {
            let tagsHTML = '';
            let tagsHTMLLevel = '';
            // Add the job's level to the tags
            if (job.level) {
                tagsHTMLLevel += `<span class="tag">${job.level}</span>`;
            }

            // Add the job's languages to the tags
            if (job.languages) {
                tagsHTML += job.languages.map(lang => `<span class="tag">${lang}</span>`).join(' ');
            }

            // Add the job's tools to the tags
            if (job.tools) {
                tagsHTML += job.tools.map(tool => `<span class="tag">${tool}</span>`).join(' ');
            }


            $('#modalJobLogo').attr('src', job.logo);
            const modalJobDetails = `<h2>${job.position} ${job.featured ? '<span class="job-featured">FEATURED</span>' : ''}</h2>
                            <p><b>Company:</b> ${job.company}</p>
                            <p><b>Location:</b> ${job.location}</p>
                            <p><b>Level:</b> ${tagsHTMLLevel}</p>
                            <p><b>Contract:</b> ${job.contract}</p>
                            <p><b>Posted At:</b> ${job.postedAt} ${job.new ? '<span class="job-new">NEW!</span>' : ''}</p>
                            <div class="job-tags">${tagsHTML}</div>
                            <button id="deleteJobBtn" style="margin-top: 10px;">Delete Job</button>`;
            $('#modalJobDetails').html(modalJobDetails);
            $('#deleteJobBtn').attr('data-jobId', jobId); // Attach jobId to delete button
            $('#jobModal').show();
        }
    });
}