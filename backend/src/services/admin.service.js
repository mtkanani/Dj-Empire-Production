import { Role, UserStatus, ApprovalStatus } from '@prisma/client';
import { UserRepository } from '../repositories/user.repository.js';
import { OrganizerRepository } from '../repositories/organizer.repository.js';
import { TokenRepository } from '../repositories/token.repository.js';
import { AdminRepository } from '../repositories/admin.repository.js';
import { CategoryRepository } from '../repositories/category.repository.js';
import { CityRepository } from '../repositories/city.repository.js';
import { VenueRepository } from '../repositories/venue.repository.js';
import { HashUtil } from '../utils/hash.util.js';
import { JwtConfig } from '../config/jwt.js';
import { EmailService } from './email.service.js';
import { AppError } from '../utils/AppError.js';
import { HTTP_STATUS } from '../constants/httpStatusCodes.js';

/**
 * Super Admin Service implementing Admin Dashboard, Organizer/Customer Management, and Master Data CRUD
 */
export class AdminService {
  /**
   * Super Admin Login
   */
  static async adminLogin(email, password, deviceInfo = null) {
    const user = await UserRepository.findByEmail(email);
    if (!user || user.role !== Role.SUPER_ADMIN) {
      throw new AppError('Invalid admin email or password', HTTP_STATUS.UNAUTHORIZED);
    }

    const isPasswordValid = await HashUtil.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid admin email or password', HTTP_STATUS.UNAUTHORIZED);
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new AppError('Admin account is suspended or inactive', HTTP_STATUS.FORBIDDEN);
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    const accessToken = JwtConfig.signAccessToken(tokenPayload);
    const refreshToken = JwtConfig.signRefreshToken({ userId: user.id });

    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7);

    await TokenRepository.createToken({
      userId: user.id,
      token: refreshToken,
      deviceInfo,
      expiresAt: refreshExpiresAt,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      tokens: { accessToken, refreshToken },
    };
  }

  // ==================== DASHBOARD & ANALYTICS ====================
  static async getDashboard() {
    return AdminRepository.getDashboardMetrics();
  }

  static async getAllEvents(statusFilter) {
    return AdminRepository.findAllEvents(statusFilter);
  }

  // ==================== ORGANIZER MANAGEMENT ====================
  static async getAllOrganizers(statusFilter) {
    const aliases = {
      pending: UserStatus.PENDING_APPROVAL,
      PENDING: UserStatus.PENDING_APPROVAL,
      PENDING_APPROVAL: UserStatus.PENDING_APPROVAL,
      active: UserStatus.ACTIVE,
      ACTIVE: UserStatus.ACTIVE,
      suspended: UserStatus.SUSPENDED,
      SUSPENDED: UserStatus.SUSPENDED,
      PENDING_EMAIL_VERIFICATION: UserStatus.PENDING_EMAIL_VERIFICATION,
    };
    const normalized = statusFilter && statusFilter !== 'ALL'
      ? (aliases[statusFilter] || aliases[String(statusFilter).toUpperCase()] || statusFilter)
      : null;
    return AdminRepository.findAllOrganizers(normalized);
  }

  static async getOrganizerById(id) {
    const organizer = await AdminRepository.findOrganizerById(id);
    if (!organizer) {
      throw new AppError('Event Organizer not found', HTTP_STATUS.NOT_FOUND);
    }
    return organizer;
  }

  static async approveOrganizer(id) {
    const user = await UserRepository.findById(id);
    if (!user || user.role !== Role.EVENT_ORGANIZER) {
      throw new AppError('Event Organizer account not found', HTTP_STATUS.NOT_FOUND);
    }

    if (user.organizerProfile) {
      await OrganizerRepository.updateApprovalStatus(user.organizerProfile.id, ApprovalStatus.APPROVED);
    }

    await UserRepository.updateStatus(user.id, UserStatus.ACTIVE);
    await EmailService.sendOrganizerApprovalEmail(user.email, user.organizerProfile?.companyName || user.firstName);

    return { message: 'Organizer account approved and activated successfully.' };
  }

  static async rejectOrganizer(id, reason) {
    const user = await UserRepository.findById(id);
    if (!user || user.role !== Role.EVENT_ORGANIZER) {
      throw new AppError('Event Organizer account not found', HTTP_STATUS.NOT_FOUND);
    }

    if (user.organizerProfile) {
      await OrganizerRepository.updateApprovalStatus(user.organizerProfile.id, ApprovalStatus.REJECTED, reason);
    }

    return { message: 'Organizer application rejected.' };
  }

  static async suspendOrganizer(id) {
    const user = await UserRepository.findById(id);
    if (!user || user.role !== Role.EVENT_ORGANIZER) {
      throw new AppError('Event Organizer account not found', HTTP_STATUS.NOT_FOUND);
    }

    await UserRepository.updateStatus(user.id, UserStatus.SUSPENDED);
    await TokenRepository.revokeAllUserTokens(user.id);

    return { message: 'Organizer account suspended successfully.' };
  }

  // ==================== CUSTOMER MANAGEMENT ====================
  static async getAllCustomers() {
    return AdminRepository.findAllCustomers();
  }

  static async getCustomerById(id) {
    const customer = await AdminRepository.findCustomerById(id);
    if (!customer) {
      throw new AppError('Customer not found', HTTP_STATUS.NOT_FOUND);
    }
    return customer;
  }

  static async suspendCustomer(id) {
    const user = await UserRepository.findById(id);
    if (!user || user.role !== Role.CUSTOMER) {
      throw new AppError('Customer account not found', HTTP_STATUS.NOT_FOUND);
    }

    await UserRepository.updateStatus(user.id, UserStatus.SUSPENDED);
    await TokenRepository.revokeAllUserTokens(user.id);

    return { message: 'Customer account suspended successfully.' };
  }

  static async activateCustomer(id) {
    const user = await UserRepository.findById(id);
    if (!user || user.role !== Role.CUSTOMER) {
      throw new AppError('Customer account not found', HTTP_STATUS.NOT_FOUND);
    }

    await UserRepository.updateStatus(user.id, UserStatus.ACTIVE);
    return { message: 'Customer account activated successfully.' };
  }

  // ==================== CATEGORY CRUD ====================
  static async createCategory(dto) {
    const slug = dto.slug || dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existing = await CategoryRepository.findByNameOrSlug(dto.name, slug);
    if (existing) {
      throw new AppError('Category with this name or slug already exists', HTTP_STATUS.CONFLICT);
    }

    return CategoryRepository.create({
      name: dto.name,
      slug,
      description: dto.description || null,
      icon: dto.icon || null,
    });
  }

  static async getAllCategories() {
    return CategoryRepository.findAll();
  }

  static async getCategoryById(id) {
    const category = await CategoryRepository.findById(id);
    if (!category) throw new AppError('Category not found', HTTP_STATUS.NOT_FOUND);
    return category;
  }

  static async updateCategory(id, dto) {
    await this.getCategoryById(id);
    return CategoryRepository.update(id, dto);
  }

  static async deleteCategory(id) {
    await this.getCategoryById(id);
    return CategoryRepository.delete(id);
  }

  // ==================== CITY CRUD ====================
  static async createCity(dto) {
    const slug = dto.slug || dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existing = await CityRepository.findByNameOrSlug(dto.name, slug);
    if (existing) {
      throw new AppError('City with this name or slug already exists', HTTP_STATUS.CONFLICT);
    }

    return CityRepository.create({
      name: dto.name,
      slug,
      state: dto.state || null,
      country: dto.country || 'India',
    });
  }

  static async getAllCities() {
    return CityRepository.findAll();
  }

  static async getCityById(id) {
    const city = await CityRepository.findById(id);
    if (!city) throw new AppError('City not found', HTTP_STATUS.NOT_FOUND);
    return city;
  }

  static async updateCity(id, dto) {
    await this.getCityById(id);
    return CityRepository.update(id, dto);
  }

  static async deleteCity(id) {
    await this.getCityById(id);
    return CityRepository.delete(id);
  }

  // ==================== VENUE CRUD ====================
  static async createVenue(dto) {
    const city = await CityRepository.findById(dto.cityId);
    if (!city) throw new AppError('Specified City not found', HTTP_STATUS.BAD_REQUEST);

    return VenueRepository.create(dto);
  }

  static async getAllVenues() {
    return VenueRepository.findAll();
  }

  static async getVenueById(id) {
    const venue = await VenueRepository.findById(id);
    if (!venue) throw new AppError('Venue not found', HTTP_STATUS.NOT_FOUND);
    return venue;
  }

  static async updateVenue(id, dto) {
    await this.getVenueById(id);
    if (dto.cityId) {
      const city = await CityRepository.findById(dto.cityId);
      if (!city) throw new AppError('Specified City not found', HTTP_STATUS.BAD_REQUEST);
    }
    return VenueRepository.update(id, dto);
  }

  static async deleteVenue(id) {
    await this.getVenueById(id);
    return VenueRepository.delete(id);
  }

  // ==================== PLATFORM PAYMENTS ====================
  static async getAllPayments(query = {}) {
    return AdminRepository.findAllPayments(query);
  }
}
