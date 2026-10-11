-- Generated from data/scholarship_data.csv. Run the entire file.
-- Existing matching records are skipped, not overwritten.
BEGIN;
SET LOCAL standard_conforming_strings = on;

INSERT INTO public.scholarships (
    name, provider, url, amount_min, amount_max, deadline, degree_levels, eligible_majors, min_gpa, eligibility_text, application_requirements, residency_states, citizenship_requirements, eligible_schools, enrollment_status, financial_need_required
)
VALUES
('$1,500 Annual Video Contest Scholarship for Students', 'IvyPanda', 'https://ivypanda.com/scholarship-video', 500, 1000, DATE '2026-10-31', 'Bachelor''s Degree;High School', 'not specified', NULL, 'We will accept videos from current high school, college, or university students from any country. The winners will be required to send us proof of their academic status or enrollment.', 'Record an original video on one of the following topics:

When everyone has AI, what makes a student''s work truly stand out?
Career planning in the age of AI: How should students prepare today?
If AI were your classmate, what could it teach you – and what would it never understand?', NULL, NULL, NULL, NULL, FALSE),
('$2,000 College Scholarship for the Business Leaders of Tomorrow', 'Business Broker Network', 'https://www.careeronestop.org/Toolkit/Training/find-scholarships-detail.aspx?&scholarshipId=9997871', 2000, 2000, DATE '2026-10-30', 'Bachelor''s Degree', 'not specified', NULL, 'Applicant must be a current college freshmen, sophomore, or senior enrolled in a college or university in the United States or U.S. territories; must be between the ages of 17-24.', 'Applicant must submit an 800-word or less essay on the following prompt "Choose an entrepreneur or business leader that you admire and answer the following questions": What entrepreneurial qualities do you believe have allowed them to achieve their success? How has this person positively impacted society? What have you learned from your person''s journey? As a future business leader, what do you hope to accomplish that will positively affect society? Essay should be submitted via email. File name should be applicant''s full name and date of birth; subject line should have year and name of scholarship.', NULL, NULL, NULL, NULL, FALSE),
('A Flight Away', 'A Leap Ahead Foundation', 'https://aleapaheadfoundation.org/scholarship-application', 2000, 2000, DATE '2026-10-31', 'Associate Degree;Bachelor''s Degree;Graduate Degree', 'not specified', NULL, 'Applicants must be U.S. residents, at least 18 years old, and enrolled or pursuing enrollment at a U.S. university in an Associate’s, Bachelor’s, Master’s, or Professional degree program.', 'Entries will be evaluated based on the essay response.
Which school do you hope to attend, and how will an out-of-state move help you reach your academic and personal goals? (3-5 sentences)', NULL, 'resident', NULL, NULL, NULL),
('Awarding over $30,000 in Scholarships in Broadcasting & Electronic Media', 'Broadcast Education Association', 'https://beaweb.org/scholarships/', 30000, 30000, DATE '2026-10-16', 'Bachelor''s Degree;Graduate Degree', 'media production, research, and education', NULL, 'Scholarships are awarded to students that will be juniors, seniors and/or graduate students at BEA member institutions.', '"______ 2. College transcripts
All transcripts must be submitted through the online application portal. If you have attended
more than one school, please upload a transcript from each institution. (If work at a previous
school is included in your present transcript that will suffice IF all courses taken, the individual
credit hours, and specific grades are given.) Unofficial student copies of transcripts are
acceptable if they are legible and if your name appears on them. (Some online transcripts
lack the student’s name and are not acceptable.) Transcripts must include individual courses and
grades earned in each as well as cumulative GPA.
______ 3. Reference Letters
Obtain TWO letters of recommendation. Upload copies of these letters with your
application. At least one letter must be written by an electronic media professor and the other
may be from either a professor or an industry professional. Both must be submitted on the
reference’s letterhead with your mailed or online application.
______ 4. Library of American Broadcasting Scholarship
If you are applying for the LAB scholarship you MUST upload a copy of your thesis or
dissertation proposal abstract."', NULL, NULL, NULL, NULL, NULL),
('Academic Hero Scholarship', 'Course Hero Inc.', 'https://www.coursehero.com/scholarships/', 20000, 20000, DATE '2026-10-31', 'Bachelor''s Degree', 'not specified', 3, 'Applicant must be at least 16 years old and enrolled in a U.S. high school or college; must be a U.S citizen; must have a minimum 3.0 GPA.', 'Applicant must fill out the scholarship form on the website at www.coursehero.com/. Applicant must create a free account, fill out an application, complete the essay, and submit their application on the portal.', NULL, 'citizen', NULL, NULL, NULL),
('2027 ACA-ACJS Student Research Award', 'The Academy of Criminal Justice Sciences', 'https://www.acjs.org/acjs-section-awards/', 200, 500, DATE '2026-10-09', 'Bachelor''s Degree;Graduate Degree', 'not specified', NULL, '1. Applicants must be enrolled in a graduate or undergraduate program at the time of submission.', 'Students must have submitted an abstract to ACJS for any student paper, poster, or roundtable session or any regular paper session or roundtable on or before the final conference submission deadline, October 9, 2026, and must present their work at the 2026 Annual Meeting.

The student paper must have a corrections-related focus, broadly defined.
Papers should be sole authored.
Submit a YouTube or Zoom video in which you present/explain your research using .ppt or pdf slides. Video presentations (including your .ppt or .pdf slides) should be a total of 8-10 minutes in length.', NULL, NULL, NULL, NULL, NULL),
('Steel Intern Scholarships', 'Association for Iron and Steel Technology', 'http://aist.org/students-faculty/scholarships/steel-intern-scholarships', 7500, 12000, DATE '2026-10-14', 'Bachelor''s Degree;Graduate Degree', 'engineering', 2.5, 'Students studying engineering or engineering technology disciplines, in addition to computer science, data science, environmental/sustainability science, and safety or industrial safety program
Applications will be accepted from university sophomore and junior applicants, and university seniors planning to attend their first year of graduate school.
Applicant must be enrolled full-time in a four-year undergraduate (minimum of 12 credits) or graduate program (minimum of 8 credits) at an accredited North American university. An applicant working full-time does not qualify.
Applicant should have a minimum cumulative GPA of 2.5 on a 4.0 scale.
Application, essay and recommendation letter should express a strong interest in the iron and steel industry.
Applicant must be a citizen of an USMCA country (USA, Canada, Mexico) 
Applicant must be available, willing and able to relocate for the summer internship.
While not required, student membership to AIST through the Material Advantage Student Program, will enhance the application.', 'Resume – Including current academic information, work, extra-curricular activities and leadership positions including student membership to AIST through the Material Advantage Student Program, if applicable. Resume must be submitted in pdf format.
Essay - not to exceed two pages in length, citing professional goals, explaining why the student is interested in a career in the steel industry, and discussing how your skills could be applied to enhance the industry.
Recommendation Letter(s) - A minimum of one letter is required, with a maximum of five letters being accepted. The letter(s) should be written by a professional familiar with the student’s work and/or interests. Letters written by a representative of a steel-related company and/or a discipline-related professor will be given more weight in the scoring process. To obtain the highest score, applicants should submit a letter from both a representative of a steel-related company and a discipline-related professor. 
Transcript - A current academic transcript or other documentation of academic standing and performance from a university. Official or Unofficial transcripts are accepted and must include the university and applicant name.', NULL, 'citizen', NULL, 'full-time', NULL),
('Alamo IFT Scholarship', 'Alamo Section Institute of Food Technologists', 'https://form.jotform.com/alamoift/2026-scholarship-application-form', 3000, 3000, DATE '2026-10-09', 'Undergraduate', 'Food Science and Technology; Culinary Arts', NULL, 'The student must be an undergraduate that is currently enrolled and pursuing a degree in Food Science and Technology or the Culinary Arts.
Recipients must have completed 2 semesters of studies in Food Science and Technology or be enrolled in the Culinary Arts program at The CIA-SA or St. Phillips or The Art Institute.
Recipients must be enrolled full time in the Fall Semester 2026.
Applicants will be reviewed by the Alamo Section Scholarship Committee.
Recipients may be asked to be a liaison between IFT Alamo Section and the student groups.
Recipients will be asked to attend and help with the Alamo IFT Golf Tournament on November 5, 2026 in San Antonio.  Scholarship will be awarded at this event.', '1. A copy of your transcript (Please make it an official copy. Grades downloaded from the internet will not be accepted).

2.  A letter of recommendation from a faculty member familiar with your work.

3.  List two individuals as references. Your choice of references must have knowledge of your academic performance.', NULL, NULL, NULL, 'full-time', NULL),
('Alberta Holstein Association Scholarship Program', 'Alberta Holstein Association Scholarship', 'https://albertaholstein.ca/scholarships/', 1000, 1000, DATE '2026-10-31', 'post-secondary', NULL, NULL, 'must have completed at least the first year of
university/college; and must be returning to school within
the calendar year.
Must be a regular or junior member of the Alberta Branch
Holstein Canada, or a son/daughter of a member', 'The student’s most recent post-secondary transcripts, a
resume and required essay must accompany application
form.
The required 500 to 1000-word essay must explain farm
involvement, volunteer experience along with future
employment ambitions.', NULL, NULL, NULL, NULL, NULL),
('Alma H. Young Emerging Scholar Award', 'Urban Affairs Association', 'https://urbanaffairsassociation.org/awards/alma-h-young-emerging-scholar-award/', 1000, 1000, DATE '2026-10-16', 'phd', NULL, NULL, 'Current Doctoral Graduate Students. Student pursuing doctoral research related to urban affairs, regardless of academic discipline, are eligible to apply. Applicants must:

Have finished their coursework;
Be making good progress towards the completion of their dissertation; and
The applicant OR their nominator must hold a UAA membership.
OR

Post-Doctoral Graduates. Recent doctoral graduates who received their degree within the past four years and completed research related to urban affairs, in any disciplinary field, are eligible to apply. Applicants must:

Provide official documentation of a degree earned in 2023, 2024, 2025, or 2026 (e.g. picture of degree diploma; letter from university); and
The applicant OR their nominator must hold a UAA membership.', 'Personal Statement: A personal statement by the applicant describing the applicant’s urban interests, engagement, and career plans. The statement should be no more than 1000 words.
Curriculum Vitae or Resume: The student’s most recent curriculum vitae or resume.
Dissertation Proposal or Abstract of Dissertation (1500-2000 word limit*): A proposal for the dissertation that indicates the research questions, argument or hypotheses, literature and data sources, methodology, and nature of expected findings. Alternatively, if you have graduated and completed your dissertation, you can submit an abstract describing your research questions, methodology, and findings.
*Please note: Bibliography references and/or appendices do not count towards the 1,500-2,000 word limit.
Nomination Letter: The nominator must have a formal professional role that allows them to assess the nominee’s achievements, current academic status and progress. This letter must attest that the student has completed coursework and is making good progress towards the completion of their dissertation. The nomination letter should be on letterhead and signed by the nominator. Once prepared, the letter should be converted to a PDF format. Do NOT submit more than one letter of nomination. Only one letter will be forwarded to the selection committee.
Documentation of degree earned in 2023, 2024, 2025 or 2026 (post-doctoral applicants only) Examples of documentation: picture of degree diploma, letter from university, etc.', NULL, NULL, NULL, NULL, NULL)
ON CONFLICT (provider, name, url) DO NOTHING
RETURNING id, name;

COMMIT;

SELECT COUNT(*) AS scholarship_count FROM public.scholarships;
