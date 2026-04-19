// backend/src/controllers/adminController.js
import {
  Slider,
  People,
  Program,
  News,
  Event,
  Achievement,
  Newsletter,
  DirectoryEntry,
  InfoBlock,
  Research,
  Facility,
  User,
  Opportunity,
  ProgramSection,
  CurriculumSemester,
  CurriculumCourse,
  ProgramOutcome,
  SectionContent,
} from "../db/models/index.js";
import { Op } from "sequelize";
import { generateSlug } from "../utils/slugUtils.js";
import cloudinary from "../config/cloudinary.js";
import crypto from "crypto";

const safeJSON = (value, fallback = []) => {
  if (value === undefined) return fallback;
  if (typeof value === "object") return value;
  if (typeof value === "string") {
    if (value.trim() === "") return fallback;
    try {
      const p = JSON.parse(value);
      return Array.isArray(p) ? p : fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
};

const parseBool = (v) => {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") {
    if (v.toLowerCase() === "false") return false;
    if (v.toLowerCase() === "true") return true;
  }
  return v === undefined ? undefined : Boolean(v);
};

const getPublicIdFromCloudinaryUrl = (url) => {
  try {
    if (!url) return null;
    const idx = url.indexOf("/upload/");
    if (idx === -1) return null;
    let after = url.substring(idx + "/upload/".length).replace(/^v\d+\//, "");
    const dot = after.lastIndexOf(".");
    if (dot !== -1) after = after.substring(0, dot);
    return after;
  } catch {
    return null;
  }
};

const deleteCloudinaryResource = async (url, resourceType = "image") => {
  try {
    const publicId = getPublicIdFromCloudinaryUrl(url);
    if (!publicId) return false;
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return true;
  } catch (err) {
    console.warn("Cloudinary deletion failed", err?.message);
    return false;
  }
};

/* ── SLIDERS ── */
export const getAllSliders = async (req, res, next) => {
  try {
    const sliders = await Slider.findAll({
      where: { dept: req.dept },
      order: [["order", "ASC"]],
    });
    res.json({ data: sliders });
  } catch (error) {
    next(error);
  }
};

export const createSlider = async (req, res, next) => {
  try {
    const { caption } = req.body;
    const order = Number(req.body.order) || 0;
    const isActive = parseBool(req.body.isActive);
    if (!req.file) return res.status(400).json({ error: "Image is required" });
    const slider = await Slider.create({
      image_path: req.file.path,
      caption,
      order,
      dept: req.dept,
      isActive: isActive === undefined ? true : isActive,
    });
    res.status(201).json({ data: slider });
  } catch (error) {
    next(error);
  }
};

export const updateSlider = async (req, res, next) => {
  try {
    const slider = await Slider.findOne({
      where: { id: req.params.id, dept: req.dept },
    });
    if (!slider) return res.status(404).json({ error: "Slider not found" });
    const { caption } = req.body;
    const order =
      req.body.order !== undefined ? Number(req.body.order) : undefined;
    const isActive = parseBool(req.body.isActive);
    const updateData = {};
    if (caption !== undefined) updateData.caption = caption;
    if (order !== undefined) updateData.order = order;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (req.file) {
      if (slider.image_path) await deleteCloudinaryResource(slider.image_path);
      updateData.image_path = req.file.path;
    }
    await slider.update(updateData);
    res.json({ data: slider });
  } catch (error) {
    next(error);
  }
};

export const deleteSlider = async (req, res, next) => {
  try {
    const slider = await Slider.findOne({
      where: { id: req.params.id, dept: req.dept },
    });
    if (!slider) return res.status(404).json({ error: "Slider not found" });
    if (slider.image_path) await deleteCloudinaryResource(slider.image_path);
    await slider.destroy();
    res.json({ data: { message: "Slider deleted successfully" } });
  } catch (error) {
    next(error);
  }
};

/* ── PEOPLE ── */
export const getAllPeople = async (req, res, next) => {
  try {
    const people = await People.findAll({
      where: { dept: req.dept },
      order: [
        ["order", "ASC"],
        ["name", "ASC"],
      ],
    });
    res.json({ data: people });
  } catch (error) {
    next(error);
  }
};
export const createFacultyLogin = async (req, res, next) => {
  try {
    const { personId } = req.params;

    const person = await People.findOne({
      where: {
        id: personId,
        dept: req.dept,
      },
    });

    if (!person) {
      return res.status(404).json({ error: "Faculty member not found" });
    }

    if (!person.email) {
      return res.status(400).json({
        error: "Faculty email is required to generate login",
      });
    }

    const tempPassword = crypto.randomBytes(4).toString("hex");

    let user = await User.findOne({
      where: { email: person.email },
    });

    if (user) {
      const linkedPerson = await People.findOne({
        where: { user_id: user.id },
      });

      if (linkedPerson && linkedPerson.id !== person.id) {
        return res.status(400).json({
          error: "This email is already linked to another faculty profile",
        });
      }

      await user.update({
        name: person.name,
        role: "faculty",
        password_hash: tempPassword,
        must_change_password: true,
      });
    } else {
      user = await User.create({
        name: person.name,
        email: person.email,
        password_hash: tempPassword,
        role: "faculty",
        must_change_password: true,
      });
    }

    await person.update({
      user_id: user.id,
    });

    res.status(200).json({
      success: true,
      message: "Faculty login generated successfully",
      data: {
        userId: user.id,
        email: user.email,
        tempPassword,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createPerson = async (req, res, next) => {
  try {
    const {
      name,
      designation,
      person_type,
      email,
      phone,
      webpage,
      summary,
      research_areas,
      bio,
      joining_date,
      department,
      profile_sections,
    } = req.body;
    const order = Number(req.body.order) || 0;
    let slug = generateSlug(name);
    let exists = await People.findOne({ where: { slug } });
    let counter = 1;
    while (exists) {
      slug = `${generateSlug(name)}-${counter++}`;
      exists = await People.findOne({ where: { slug } });
    }
    const person = await People.create({
      name,
      slug,
      designation,
      person_type: person_type || "Faculty",
      email,
      phone,
      webpage,
      summary,
      research_areas,
      bio,
      joining_date: joining_date ? new Date(joining_date) : null,
      department: department || "Computer Science & Engineering",
      profile_sections: safeJSON(profile_sections, []),
      photo_path: req.file ? req.file.path : null,
      order,
      dept: req.dept,
    });
    res.status(201).json({
      success: true,
      message: "Faculty member created successfully",
      data: person,
    });
  } catch (err) {
    next(err);
  }
};

export const updatePerson = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      designation,
      person_type,
      email,
      phone,
      webpage,
      summary,
      research_areas,
      bio,
      joining_date,
      department,
      profile_sections,
    } = req.body;
    const order =
      req.body.order !== undefined ? Number(req.body.order) : undefined;
    const person = await People.findOne({ where: { id, dept: req.dept } });
    if (!person)
      return res.status(404).json({ error: "Faculty member not found" });
    const updateData = {};
    if (name !== undefined) {
      updateData.name = name;
      if (name !== person.name) {
        let newSlug = generateSlug(name);
        let exists = await People.findOne({
          where: { slug: newSlug, id: { [Op.ne]: id } },
        });
        let counter = 1;
        while (exists) {
          newSlug = `${generateSlug(name)}-${counter++}`;
          exists = await People.findOne({
            where: { slug: newSlug, id: { [Op.ne]: id } },
          });
        }
        updateData.slug = newSlug;
      }
    }
    if (designation !== undefined) updateData.designation = designation;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (webpage !== undefined) updateData.webpage = webpage;
    if (summary !== undefined) updateData.summary = summary;
    if (research_areas !== undefined)
      updateData.research_areas = research_areas;
    if (bio !== undefined) updateData.bio = bio;
    if (joining_date !== undefined)
      updateData.joining_date = joining_date ? new Date(joining_date) : null;
    if (department !== undefined) updateData.department = department;
    if (profile_sections !== undefined)
      updateData.profile_sections = safeJSON(profile_sections, []);
    if (order !== undefined) updateData.order = order;
    if (req.file) {
      if (person.photo_path) await deleteCloudinaryResource(person.photo_path);
      updateData.photo_path = req.file.path;
    }
    await person.update(updateData);
    await person.reload();
    res.json({
      success: true,
      message: "Faculty member updated successfully",
      data: person,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePerson = async (req, res, next) => {
  try {
    const person = await People.findOne({
      where: { id: req.params.id, dept: req.dept },
    });
    if (!person)
      return res.status(404).json({ error: "Faculty member not found" });
    if (person.photo_path) await deleteCloudinaryResource(person.photo_path);
    await person.destroy();
    res.json({ data: { message: "Faculty member deleted successfully" } });
  } catch (error) {
    next(error);
  }
};

/* ── PROGRAMS ── */
export const getAllPrograms = async (req, res, next) => {
  try {
    const programs = await Program.findAll({
      where: { dept: req.dept },
      order: [
        ["level", "ASC"],
        ["display_order", "ASC"],
        ["name", "ASC"],
      ],
      include: [
        {
          model: ProgramSection,
          as: "sections",
          separate: true,
          order: [["display_order", "ASC"]],
          include: [
            {
              model: CurriculumSemester,
              as: "semesters",
              separate: true,
              order: [["display_order", "ASC"]],
              include: [
                {
                  model: CurriculumCourse,
                  as: "courses",
                  separate: true,
                  order: [["display_order", "ASC"]],
                },
              ],
            },
            {
              model: ProgramOutcome,
              as: "outcomes",
              separate: true,
              order: [["display_order", "ASC"]],
            },
            { model: SectionContent, as: "content" },
          ],
        },
      ],
    });
    res.json({ data: programs });
  } catch (error) {
    next(error);
  }
};

export const createProgram = async (req, res, next) => {
  try {
    const {
      name,
      short_name,
      level,
      description,
      overview,
      duration,
      total_credits,
    } = req.body;
    const display_order = Number(req.body.display_order) || 0;
    const program = await Program.create({
      name,
      short_name,
      level,
      description,
      overview,
      duration,
      total_credits,
      display_order,
      dept: req.dept,
      curriculum_pdf_path: req.file ? req.file.path : null,
    });
    res.status(201).json({ data: program });
  } catch (error) {
    next(error);
  }
};

export const updateProgram = async (req, res, next) => {
  try {
    const program = await Program.findOne({
      where: { id: req.params.id, dept: req.dept },
    });
    if (!program) return res.status(404).json({ error: "Program not found" });
    const updateData = { ...req.body };
    if (req.file) {
      if (program.curriculum_pdf_path)
        await deleteCloudinaryResource(program.curriculum_pdf_path, "raw");
      updateData.curriculum_pdf_path = req.file.path;
    }
    await program.update(updateData);
    res.json({ data: program });
  } catch (error) {
    next(error);
  }
};

export const deleteProgram = async (req, res, next) => {
  try {
    const program = await Program.findOne({
      where: { id: req.params.id, dept: req.dept },
    });
    if (!program) return res.status(404).json({ error: "Program not found" });
    if (program.curriculum_pdf_path)
      await deleteCloudinaryResource(program.curriculum_pdf_path, "raw");
    await program.destroy();
    res.json({ data: { message: "Program deleted successfully" } });
  } catch (error) {
    next(error);
  }
};

/* ── PROGRAM SECTIONS (not dept-scoped — they belong to a program which is already dept-scoped) ── */
export const getProgramSections = async (req, res, next) => {
  try {
    const sections = await ProgramSection.findAll({
      where: { program_id: req.params.id },
      order: [["display_order", "ASC"]],
      include: [
        {
          model: CurriculumSemester,
          as: "semesters",
          separate: true,
          order: [["display_order", "ASC"]],
          include: [
            {
              model: CurriculumCourse,
              as: "courses",
              separate: true,
              order: [["display_order", "ASC"]],
            },
          ],
        },
        {
          model: ProgramOutcome,
          as: "outcomes",
          separate: true,
          order: [["display_order", "ASC"]],
        },
        { model: SectionContent, as: "content" },
      ],
    });
    res.json({ data: sections });
  } catch (error) {
    next(error);
  }
};

export const createProgramSection = async (req, res, next) => {
  try {
    const program_id = req.params.id || req.body.program_id;
    if (!program_id)
      return res.status(400).json({ error: "program_id is required" });
    const { title, section_type } = req.body;
    if (!title || !section_type)
      return res.status(400).json({ error: "title and section_type required" });
    const display_order = Number(req.body.display_order) || 0;
    const is_expanded = parseBool(req.body.is_expanded) || false;
    const section = await ProgramSection.create({
      program_id,
      title,
      section_type,
      display_order,
      is_expanded,
    });
    const created = await ProgramSection.findByPk(section.id, {
      include: [
        { model: CurriculumSemester, as: "semesters", separate: true },
        { model: ProgramOutcome, as: "outcomes", separate: true },
        { model: SectionContent, as: "content" },
      ],
    });
    res.status(201).json({ data: created });
  } catch (error) {
    next(error);
  }
};

export const updateProgramSection = async (req, res, next) => {
  try {
    const section = await ProgramSection.findByPk(req.params.id);
    if (!section) return res.status(404).json({ error: "Section not found" });
    const updateData = {};
    if (req.body.title !== undefined) updateData.title = req.body.title;
    if (req.body.section_type !== undefined)
      updateData.section_type = req.body.section_type;
    if (req.body.display_order !== undefined)
      updateData.display_order = Number(req.body.display_order);
    if (req.body.is_expanded !== undefined)
      updateData.is_expanded = parseBool(req.body.is_expanded);
    await section.update(updateData);
    res.json({ data: section });
  } catch (error) {
    next(error);
  }
};

export const deleteProgramSection = async (req, res, next) => {
  try {
    const section = await ProgramSection.findByPk(req.params.id);
    if (!section) return res.status(404).json({ error: "Section not found" });
    await section.destroy();
    res.json({ data: { message: "Section deleted successfully" } });
  } catch (error) {
    next(error);
  }
};

export const updateSectionContent = async (req, res, next) => {
  try {
    const { section_id, content_html } = req.body;
    if (!section_id)
      return res.status(400).json({ error: "section_id required" });
    let content = await SectionContent.findOne({ where: { section_id } });
    if (content) {
      await content.update({ content_html });
    } else {
      content = await SectionContent.create({ section_id, content_html });
    }
    res.json({ data: content });
  } catch (error) {
    next(error);
  }
};

export const createProgramOutcome = async (req, res, next) => {
  try {
    const section_id = req.params?.id || req.body.section_id;
    if (!section_id)
      return res.status(400).json({ error: "section_id required" });
    const { outcome_code, outcome_text } = req.body;
    if (!outcome_code || !outcome_text)
      return res.status(400).json({ error: "code and text required" });
    const outcome = await ProgramOutcome.create({
      section_id,
      outcome_code,
      outcome_text,
      display_order: Number(req.body.display_order) || 0,
    });
    res.status(201).json({ data: outcome });
  } catch (error) {
    next(error);
  }
};

export const updateProgramOutcome = async (req, res, next) => {
  try {
    const outcome = await ProgramOutcome.findByPk(req.params.id);
    if (!outcome) return res.status(404).json({ error: "Outcome not found" });
    await outcome.update(req.body);
    res.json({ data: outcome });
  } catch (error) {
    next(error);
  }
};

export const deleteProgramOutcome = async (req, res, next) => {
  try {
    const outcome = await ProgramOutcome.findByPk(req.params.id);
    if (!outcome) return res.status(404).json({ error: "Outcome not found" });
    await outcome.destroy();
    res.json({ data: { message: "Outcome deleted successfully" } });
  } catch (error) {
    next(error);
  }
};

/* ── CURRICULUM ── */
export const createCurriculumSemester = async (req, res, next) => {
  try {
    const section_id = req.params.sectionId || req.body.section_id;
    if (!section_id)
      return res.status(400).json({ error: "section_id is required" });
    const semester = await CurriculumSemester.create({
      section_id,
      semester_number: req.body.semester_number,
      semester_name: req.body.semester_name,
      display_order: Number(req.body.display_order) || 0,
    });
    res.status(201).json({ data: semester });
  } catch (error) {
    next(error);
  }
};

export const deleteCurriculumSemester = async (req, res, next) => {
  try {
    const semester = await CurriculumSemester.findByPk(req.params.id);
    if (!semester) return res.status(404).json({ error: "Semester not found" });
    await semester.destroy();
    res.json({ data: { message: "Semester deleted successfully" } });
  } catch (error) {
    next(error);
  }
};

export const createCurriculumCourse = async (req, res, next) => {
  try {
    const {
      semester_id,
      course_name,
      course_type,
      theory_hours,
      lab_hours,
      tutorial_hours,
      practical_hours,
      credits,
    } = req.body;
    if (!semester_id)
      return res.status(400).json({ error: "semester_id required" });
    if (!course_name)
      return res.status(400).json({ error: "course_name required" });
    const course = await CurriculumCourse.create({
      semester_id,
      course_name,
      course_type,
      theory_hours: Number(theory_hours) || 0,
      lab_hours: Number(lab_hours) || 0,
      tutorial_hours: Number(tutorial_hours) || 0,
      practical_hours: Number(practical_hours) || 0,
      credits,
      display_order: Number(req.body.display_order) || 0,
    });
    res.status(201).json({ data: course });
  } catch (error) {
    next(error);
  }
};

export const updateCurriculumCourse = async (req, res, next) => {
  try {
    const course = await CurriculumCourse.findByPk(req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found" });
    await course.update(req.body);
    res.json({ data: course });
  } catch (error) {
    next(error);
  }
};

export const deleteCurriculumCourse = async (req, res, next) => {
  try {
    const course = await CurriculumCourse.findByPk(req.params.id);
    if (!course) return res.status(404).json({ error: "Course not found" });
    await course.destroy();
    res.json({ data: { message: "Course deleted successfully" } });
  } catch (error) {
    next(error);
  }
};

/* ── NEWS ── */
export const getAllNews = async (req, res, next) => {
  try {
    const news = await News.findAll({
      where: { dept: req.dept },
      order: [["date", "DESC"]],
    });
    res.json({ data: news });
  } catch (error) {
    next(error);
  }
};

export const createNews = async (req, res, next) => {
  try {
    const { title, summary, body } = req.body;
    const date = req.body.date ? new Date(req.body.date) : new Date();
    const isPublished = parseBool(req.body.isPublished);
    const news = await News.create({
      title,
      date,
      summary,
      body,
      dept: req.dept,
      image_path: req.file ? req.file.path : null,
      isPublished: isPublished === undefined ? true : isPublished,
    });
    res.status(201).json({ data: news });
  } catch (error) {
    next(error);
  }
};

export const updateNews = async (req, res, next) => {
  try {
    const news = await News.findOne({
      where: { id: req.params.id, dept: req.dept },
    });
    if (!news) return res.status(404).json({ error: "News not found" });
    const updateData = { ...req.body };
    if (updateData.date) updateData.date = new Date(updateData.date);
    if (req.file) {
      if (news.image_path) await deleteCloudinaryResource(news.image_path);
      updateData.image_path = req.file.path;
    }
    await news.update(updateData);
    res.json({ data: news });
  } catch (error) {
    next(error);
  }
};

export const deleteNews = async (req, res, next) => {
  try {
    const news = await News.findOne({
      where: { id: req.params.id, dept: req.dept },
    });
    if (!news) return res.status(404).json({ error: "News not found" });
    if (news.image_path) await deleteCloudinaryResource(news.image_path);
    await news.destroy();
    res.json({ data: { message: "News deleted successfully" } });
  } catch (error) {
    next(error);
  }
};

/* ── EVENTS ── */
export const getAllEvents = async (req, res, next) => {
  try {
    const events = await Event.findAll({
      where: { dept: req.dept },
      order: [["startsAt", "DESC"]],
    });
    res.json({ data: events });
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    const { title, startsAt, endsAt, venue, description, link } = req.body;
    const isPublished = parseBool(req.body.isPublished);
    const event = await Event.create({
      title,
      startsAt,
      endsAt: endsAt || null,
      venue,
      description,
      link: link || null,
      dept: req.dept,
      banner_path: req.file ? req.file.path : null,
      isPublished: isPublished === undefined ? true : isPublished,
    });
    res.status(201).json({ data: event });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findOne({
      where: { id: req.params.id, dept: req.dept },
    });
    if (!event) return res.status(404).json({ error: "Event not found" });
    const updateData = { ...req.body };
    if (req.file) {
      if (event.banner_path) await deleteCloudinaryResource(event.banner_path);
      updateData.banner_path = req.file.path;
    }
    await event.update(updateData);
    res.json({ data: event });
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findOne({
      where: { id: req.params.id, dept: req.dept },
    });
    if (!event) return res.status(404).json({ error: "Event not found" });
    if (event.banner_path) await deleteCloudinaryResource(event.banner_path);
    await event.destroy();
    res.json({ data: { message: "Event deleted successfully" } });
  } catch (error) {
    next(error);
  }
};

/* ── ACHIEVEMENTS ── */
export const getAllAchievements = async (req, res, next) => {
  try {
    const achievements = await Achievement.findAll({
      where: { dept: req.dept },
      order: [["createdAt", "DESC"]],
    });
    res.json({ data: achievements });
  } catch (error) {
    next(error);
  }
};

export const createAchievement = async (req, res, next) => {
  try {
    const { title, students, description, link, category } = req.body;
    const isPublished = parseBool(req.body.isPublished);
    const achievement = await Achievement.create({
      title,
      category: category || "student",
      students,
      description,
      link: link || null,
      dept: req.dept,
      image_path: req.file ? req.file.path : null,
      isPublished: isPublished === undefined ? true : isPublished,
    });
    res.status(201).json({ data: achievement });
  } catch (error) {
    next(error);
  }
};

export const updateAchievement = async (req, res, next) => {
  try {
    const achievement = await Achievement.findOne({
      where: { id: req.params.id, dept: req.dept },
    });
    if (!achievement)
      return res.status(404).json({ error: "Achievement not found" });
    const isPublished = parseBool(req.body.isPublished);
    const updateData = {
      title: req.body.title,
      category: req.body.category,
      students: req.body.students,
      description: req.body.description,
      link: req.body.link || null,
    };
    if (isPublished !== undefined) updateData.isPublished = isPublished;
    if (req.file) {
      if (achievement.image_path)
        await deleteCloudinaryResource(achievement.image_path);
      updateData.image_path = req.file.path;
    }
    await achievement.update(updateData);
    res.json({ data: achievement });
  } catch (error) {
    next(error);
  }
};

export const deleteAchievement = async (req, res, next) => {
  try {
    const achievement = await Achievement.findOne({
      where: { id: req.params.id, dept: req.dept },
    });
    if (!achievement)
      return res.status(404).json({ error: "Achievement not found" });
    if (achievement.image_path)
      await deleteCloudinaryResource(achievement.image_path);
    await achievement.destroy();
    res.json({ data: { message: "Achievement deleted successfully" } });
  } catch (error) {
    next(error);
  }
};

/* ── NEWSLETTERS ── */
export const getAllNewsletters = async (req, res, next) => {
  try {
    const newsletters = await Newsletter.findAll({
      where: { dept: req.dept },
      order: [["issueDate", "DESC"]],
    });
    res.json({ data: newsletters });
  } catch (error) {
    next(error);
  }
};

export const createNewsletter = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "PDF is required" });
    const { title, issueDate, description } = req.body;
    const newsletter = await Newsletter.create({
      title,
      issueDate,
      description,
      dept: req.dept,
      pdf_path: req.file.path,
    });
    res.status(201).json({ data: newsletter });
  } catch (error) {
    next(error);
  }
};

export const updateNewsletter = async (req, res, next) => {
  try {
    const newsletter = await Newsletter.findOne({
      where: { id: req.params.id, dept: req.dept },
    });
    if (!newsletter)
      return res.status(404).json({ error: "Newsletter not found" });
    const updateData = { ...req.body };
    if (req.file) {
      if (newsletter.pdf_path)
        await deleteCloudinaryResource(newsletter.pdf_path, "raw");
      updateData.pdf_path = req.file.path;
    }
    await newsletter.update(updateData);
    res.json({ data: newsletter });
  } catch (error) {
    next(error);
  }
};

export const deleteNewsletter = async (req, res, next) => {
  try {
    const newsletter = await Newsletter.findOne({
      where: { id: req.params.id, dept: req.dept },
    });
    if (!newsletter)
      return res.status(404).json({ error: "Newsletter not found" });
    if (newsletter.pdf_path)
      await deleteCloudinaryResource(newsletter.pdf_path, "raw");
    await newsletter.destroy();
    res.json({ data: { message: "Newsletter deleted successfully" } });
  } catch (error) {
    next(error);
  }
};

/* ── DIRECTORY ── */
export const getAllDirectoryEntries = async (req, res, next) => {
  try {
    const entries = await DirectoryEntry.findAll({
      where: { dept: req.dept },
      order: [["name", "ASC"]],
    });
    res.json({ data: entries });
  } catch (error) {
    next(error);
  }
};

export const createDirectoryEntry = async (req, res, next) => {
  try {
    const { name, role, phone, email, location } = req.body;
    const entry = await DirectoryEntry.create({
      name,
      role,
      phone,
      email,
      location,
      dept: req.dept,
    });
    res.status(201).json({ data: entry });
  } catch (error) {
    next(error);
  }
};

export const updateDirectoryEntry = async (req, res, next) => {
  try {
    const entry = await DirectoryEntry.findOne({
      where: { id: req.params.id, dept: req.dept },
    });
    if (!entry)
      return res.status(404).json({ error: "Directory entry not found" });
    await entry.update({ ...req.body });
    res.json({ data: entry });
  } catch (error) {
    next(error);
  }
};

export const deleteDirectoryEntry = async (req, res, next) => {
  try {
    const entry = await DirectoryEntry.findOne({
      where: { id: req.params.id, dept: req.dept },
    });
    if (!entry)
      return res.status(404).json({ error: "Directory entry not found" });
    await entry.destroy();
    res.json({ data: { message: "Directory entry deleted successfully" } });
  } catch (error) {
    next(error);
  }
};

/* ── INFO BLOCKS ── */
export const getAllInfoBlocks = async (req, res, next) => {
  try {
    const blocks = await InfoBlock.findAll({
      where: { dept: req.dept },
      order: [["key", "ASC"]],
    });
    res.json({ data: blocks });
  } catch (error) {
    next(error);
  }
};

export const createInfoBlock = async (req, res, next) => {
  try {
    const { key, title, body } = req.body;
    const block = await InfoBlock.create({
      key,
      title,
      body,
      dept: req.dept,
      media_path: req.file ? req.file.path : null,
    });
    res.status(201).json({ data: block });
  } catch (error) {
    next(error);
  }
};

export const updateInfoBlock = async (req, res, next) => {
  try {
    const block = await InfoBlock.findOne({
      where: { id: req.params.id, dept: req.dept },
    });
    if (!block) return res.status(404).json({ error: "Info block not found" });
    const updateData = { ...req.body };
    if (req.file) {
      if (block.media_path) {
        await deleteCloudinaryResource(block.media_path, "raw");
        await deleteCloudinaryResource(block.media_path, "image");
      }
      updateData.media_path = req.file.path;
    }
    await block.update(updateData);
    res.json({ data: block });
  } catch (error) {
    next(error);
  }
};

export const deleteInfoBlock = async (req, res, next) => {
  try {
    const block = await InfoBlock.findOne({
      where: { id: req.params.id, dept: req.dept },
    });
    if (!block) return res.status(404).json({ error: "Info block not found" });
    if (block.media_path) {
      await deleteCloudinaryResource(block.media_path, "raw");
      await deleteCloudinaryResource(block.media_path, "image");
    }
    await block.destroy();
    res.json({ data: { message: "Info block deleted successfully" } });
  } catch (error) {
    next(error);
  }
};

/* ── RESEARCH ── */
export const getAllResearch = async (req, res, next) => {
  try {
    const research = await Research.findAll({
      where: { dept: req.dept },
      order: [["display_order", "ASC"]],
    });
    res.json({ data: research });
  } catch (error) {
    next(error);
  }
};

export const createResearch = async (req, res, next) => {
  try {
    const body = req.body;
    const researchData = {
      title: body.title,
      category: body.category,
      description: body.description || null,
      link: body.link || null,
      display_order: Number(body.display_order) || 0,
      dept: req.dept,
      faculty: body.category === "Project" ? body.faculty || null : null,
      pi_co_pi: body.category === "Project" ? body.pi_co_pi || null : null,
      funding_agency:
        body.category === "Project" ? body.funding_agency || null : null,
      funding_amount:
        body.category === "Project" ? body.funding_amount || null : null,
      duration: body.category === "Project" ? body.duration || null : null,
      status:
        body.category === "Project"
          ? ["Ongoing", "Completed", "Proposed", "In Progress"].includes(
              body.status,
            )
            ? body.status
            : "Ongoing"
          : null,
      authors: body.category === "Publication" ? body.authors || null : null,
      journal: body.category === "Publication" ? body.journal || null : null,
      year: body.category === "Publication" ? body.year || null : null,
      inventors: body.category === "Patent" ? body.inventors || null : null,
      application_no:
        body.category === "Patent" ? body.application_no || null : null,
      patent_status:
        body.category === "Patent" ? body.patent_status || null : null,
      collaboration_org:
        body.category === "Collaboration"
          ? body.collaboration_org || null
          : null,
    };
    if (req.file) researchData.image_path = req.file.path;
    const research = await Research.create(researchData);
    res.status(201).json({ data: research });
  } catch (error) {
    next(error);
  }
};

export const updateResearch = async (req, res, next) => {
  try {
    const research = await Research.findOne({
      where: { id: req.params.id, dept: req.dept },
    });
    if (!research) return res.status(404).json({ error: "Research not found" });
    const body = req.body;
    const updateData = {
      title: body.title,
      category: body.category,
      description: body.description || null,
      link: body.link || null,
      display_order: Number(body.display_order) || 0,
      faculty: body.category === "Project" ? body.faculty || null : null,
      pi_co_pi: body.category === "Project" ? body.pi_co_pi || null : null,
      funding_agency:
        body.category === "Project" ? body.funding_agency || null : null,
      funding_amount:
        body.category === "Project" ? body.funding_amount || null : null,
      duration: body.category === "Project" ? body.duration || null : null,
      status:
        body.category === "Project"
          ? ["Ongoing", "Completed", "Proposed", "In Progress"].includes(
              body.status,
            )
            ? body.status
            : "Ongoing"
          : null,
      authors: body.category === "Publication" ? body.authors || null : null,
      journal: body.category === "Publication" ? body.journal || null : null,
      year: body.category === "Publication" ? body.year || null : null,
      inventors: body.category === "Patent" ? body.inventors || null : null,
      application_no:
        body.category === "Patent" ? body.application_no || null : null,
      patent_status:
        body.category === "Patent" ? body.patent_status || null : null,
      collaboration_org:
        body.category === "Collaboration"
          ? body.collaboration_org || null
          : null,
    };
    if (req.file) {
      if (research.image_path)
        await deleteCloudinaryResource(research.image_path);
      updateData.image_path = req.file.path;
    }
    await research.update(updateData);
    res.json({ data: research });
  } catch (error) {
    next(error);
  }
};

export const deleteResearch = async (req, res, next) => {
  try {
    const research = await Research.findOne({
      where: { id: req.params.id, dept: req.dept },
    });
    if (!research) return res.status(404).json({ error: "Research not found" });
    if (research.image_path)
      await deleteCloudinaryResource(research.image_path);
    await research.destroy();
    res.json({ data: { message: "Research deleted successfully" } });
  } catch (error) {
    next(error);
  }
};

/* ── FACILITIES ── */
export const getAllFacilities = async (req, res, next) => {
  try {
    const facilities = await Facility.findAll({
      where: { dept: req.dept },
      order: [["display_order", "ASC"]],
    });
    res.json({ data: facilities });
  } catch (error) {
    next(error);
  }
};

export const createFacility = async (req, res, next) => {
  try {
    const facilityData = { ...req.body, dept: req.dept };
    if (req.file) facilityData.image_path = req.file.path;
    const facility = await Facility.create(facilityData);
    res.status(201).json({ data: facility });
  } catch (error) {
    next(error);
  }
};

export const updateFacility = async (req, res, next) => {
  try {
    const facility = await Facility.findOne({
      where: { id: req.params.id, dept: req.dept },
    });
    if (!facility) return res.status(404).json({ error: "Facility not found" });
    const updateData = { ...req.body };
    if (req.file) {
      if (facility.image_path)
        await deleteCloudinaryResource(facility.image_path);
      updateData.image_path = req.file.path;
    }
    await facility.update(updateData);
    res.json({ data: facility });
  } catch (error) {
    next(error);
  }
};

export const deleteFacility = async (req, res, next) => {
  try {
    const facility = await Facility.findOne({
      where: { id: req.params.id, dept: req.dept },
    });
    if (!facility) return res.status(404).json({ error: "Facility not found" });
    if (facility.image_path)
      await deleteCloudinaryResource(facility.image_path);
    await facility.destroy();
    res.json({ data: { message: "Facility deleted successfully" } });
  } catch (error) {
    next(error);
  }
};

/* Opportunities */
export const getAllOpportunities = async (req, res, next) => {
  try {
    const opportunities = await Opportunity.findAll({
      where: { dept: req.dept },
      order: [
        ["page_group", "ASC"],
        ["display_order", "ASC"],
        ["id", "DESC"],
      ],
    });
    res.json({ data: opportunities });
  } catch (error) {
    next(error);
  }
};

export const createOpportunity = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.create({
      title: req.body.title,
      page_group: req.body.page_group || "general",
      block_type: req.body.block_type || "rich_text",
      subtitle: req.body.subtitle || null,
      description: req.body.description || null,
      image_path: req.file?.path || req.body.image_path || null,
      cta_text: req.body.cta_text || null,
      cta_url: req.body.cta_url || null,
      content_html: req.body.content_html || null,
      content_json: safeJSON(req.body.content_json, null),
      display_order: Number(req.body.display_order || 0),
      is_active: parseBool(req.body.is_active) ?? true,
      dept: req.dept,
    });
    res.status(201).json({ data: opportunity });
  } catch (error) {
    next(error);
  }
};

export const updateOpportunity = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findOne({
      where: { id: req.params.id, dept: req.dept },
    });
    if (!opportunity) {
      return res.status(404).json({ error: "Opportunity not found" });
    }

    await opportunity.update({
      title: req.body.title ?? opportunity.title,
      page_group: req.body.page_group ?? opportunity.page_group,
      block_type: req.body.block_type ?? opportunity.block_type,
      subtitle: req.body.subtitle ?? opportunity.subtitle,
      description: req.body.description ?? opportunity.description,
      image_path:
        req.file?.path || req.body.image_path || opportunity.image_path,
      cta_text: req.body.cta_text ?? opportunity.cta_text,
      cta_url: req.body.cta_url ?? opportunity.cta_url,
      content_html: req.body.content_html ?? opportunity.content_html,
      content_json: req.body.content_json
        ? safeJSON(req.body.content_json, opportunity.content_json)
        : opportunity.content_json,
      display_order:
        req.body.display_order !== undefined
          ? Number(req.body.display_order)
          : opportunity.display_order,
      is_active: parseBool(req.body.is_active) ?? opportunity.is_active,
    });

    res.json({ data: opportunity });
  } catch (error) {
    next(error);
  }
};

export const deleteOpportunity = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findOne({
      where: { id: req.params.id, dept: req.dept },
    });
    if (!opportunity) {
      return res.status(404).json({ error: "Opportunity not found" });
    }

    if (opportunity.image_path) {
      await deleteCloudinaryResource(opportunity.image_path);
    }

    await opportunity.destroy();
    res.json({ data: { message: "Opportunity deleted successfully" } });
  } catch (error) {
    next(error);
  }
};
