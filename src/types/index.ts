export type UserRole = 'driver' | 'shipper' | 'admin';

export type UserStatus = 'active' | 'suspended' | 'pending';

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export type VehicleType = 'truck_light' | 'truck_medium' | 'truck_heavy' | 'trailer' | 'pickup' | 'van';

export type VehicleStatus = 'active' | 'inactive' | 'pending_verification';

export type CargoType =
  | 'general'
  | 'construction'
  | 'food'
  | 'industrial'
  | 'agricultural'
  | 'hazardous'
  | 'refrigerated'
  | 'vehicles'
  | 'other';

export type LoadingType = 'manual' | 'forklift' | 'crane' | 'ramp';

export type CargoStatus =
  | 'open'
  | 'assigned'
  | 'in_transit'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'expired';

export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

export type ShipmentStatus =
  | 'created'
  | 'accepted'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export type ShipmentEventType =
  | 'created'
  | 'accepted'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'note';

export type NotificationType =
  | 'offer_received'
  | 'offer_accepted'
  | 'offer_rejected'
  | 'offer_withdrawn'
  | 'shipment_created'
  | 'shipment_status_update'
  | 'shipment_pickup_confirmed'
  | 'shipment_delivery_confirmed'
  | 'rating_received'
  | 'verification_update'
  | 'vehicle_approved'
  | 'admin_message'
  | 'return_cargo_suggestion';

export type WalletTransactionType =
  | 'credit'
  | 'debit'
  | 'commission'
  | 'refund'
  | 'bonus'
  | 'penalty';

export interface Profile {
  id: string;
  role: UserRole;
  phone: string | null;
  full_name: string;
  avatar_url: string | null;
  status: UserStatus;
  city: string | null;
  created_at: string;
  updated_at: string;
}

export interface DriverProfile {
  id: string;
  user_id: string;
  national_id: string | null;
  license_number: string | null;
  license_expiry: string | null;
  license_image_url: string | null;
  verification_status: VerificationStatus;
  verification_note: string | null;
  rating: number;
  total_ratings: number;
  total_deliveries: number;
  is_online: boolean;
  current_location: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShipperProfile {
  id: string;
  user_id: string;
  company_name: string | null;
  national_id: string | null;
  company_registration_number: string | null;
  verification_status: VerificationStatus;
  verification_note: string | null;
  rating: number;
  total_ratings: number;
  total_shipments: number;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  driver_id: string;
  plate_number: string;
  vehicle_type: VehicleType;
  capacity_kg: number;
  capacity_volume: number | null;
  length_m: number | null;
  width_m: number | null;
  height_m: number | null;
  insurance_number: string | null;
  insurance_expiry: string | null;
  registration_image_url: string | null;
  status: VehicleStatus;
  created_at: string;
  updated_at: string;
}

export interface Cargo {
  id: string;
  shipper_id: string;
  title: string;
  description: string | null;
  origin_city: string;
  origin_address: string | null;
  destination_city: string;
  destination_address: string | null;
  cargo_type: CargoType;
  weight_kg: number;
  volume: number | null;
  required_vehicle_type: string | null;
  loading_type: LoadingType;
  pickup_date: string;
  delivery_date: string | null;
  price_toman: number;
  commission_rate: number;
  commission_amount: number;
  insurance_required: boolean;
  status: CargoStatus;
  created_at: string;
  updated_at: string;
}

export interface Offer {
  id: string;
  cargo_id: string;
  driver_id: string;
  vehicle_id: string | null;
  offered_price_toman: number;
  commission_rate: number;
  commission_amount: number;
  message: string | null;
  estimated_pickup_time: string | null;
  status: OfferStatus;
  created_at: string;
  updated_at: string;
}

export interface Shipment {
  id: string;
  cargo_id: string;
  shipper_id: string;
  driver_id: string;
  offer_id: string | null;
  vehicle_id: string | null;
  agreed_price_toman: number;
  commission_rate: number;
  commission_amount: number;
  status: ShipmentStatus;
  pickup_time: string | null;
  delivery_time: string | null;
  completion_time: string | null;
  pickup_confirmed: boolean;
  delivery_confirmed: boolean;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShipmentEvent {
  id: string;
  shipment_id: string;
  event_type: ShipmentEventType;
  status_from: string | null;
  status_to: string;
  note: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Rating {
  id: string;
  shipment_id: string;
  rater_id: string;
  ratee_id: string;
  rater_role: 'shipper' | 'driver';
  score: number;
  comment: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  related_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface WalletTransaction {
  id: string;
  user_id: string;
  shipment_id: string | null;
  type: WalletTransactionType;
  amount_toman: number;
  balance_after: number;
  description: string | null;
  status: string;
  created_at: string;
}

export interface ReturnCargoSuggestion {
  id: string;
  driver_id: string;
  cargo_id: string | null;
  shipment_id: string | null;
  origin_city: string;
  destination_city: string;
  match_score: number;
  status: 'suggested' | 'viewed' | 'accepted' | 'dismissed';
  created_at: string;
}

export interface CommissionSettings {
  id: string;
  rate_percent: number;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
