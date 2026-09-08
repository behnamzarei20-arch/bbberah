import { supabase } from '@/lib/supabase';
import { showToast } from '@/components/ui/Toast';
import type { Notification, Shipment, ShipmentStatus } from '@/types';

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  body?: string,
  relatedId?: string
) {
  try {
    await supabase.rpc('create_notification', {
      p_user_id: userId,
      p_type: type,
      p_title: title,
      p_body: body || null,
      p_related_id: relatedId || null,
    });
  } catch (err) {
    console.error('Notification error:', err);
  }
}

export async function createShipmentEvent(
  shipmentId: string,
  eventType: string,
  statusTo: string,
  statusFrom?: string,
  note?: string,
  createdBy?: string
) {
  try {
    await supabase.rpc('create_shipment_event', {
      p_shipment_id: shipmentId,
      p_event_type: eventType,
      p_status_to: statusTo,
      p_status_from: statusFrom || null,
      p_note: note || null,
      p_created_by: createdBy || null,
    });
  } catch (err) {
    console.error('Shipment event error:', err);
  }
}

export async function updateShipmentStatus(
  shipment: Shipment,
  newStatus: ShipmentStatus,
  userId: string,
  note?: string
): Promise<boolean> {
  const { error } = await supabase
    .from('shipments')
    .update({
      status: newStatus,
      ...(newStatus === 'picked_up' && { pickup_time: new Date().toISOString(), pickup_confirmed: true }),
      ...(newStatus === 'delivered' && { delivery_time: new Date().toISOString(), delivery_confirmed: true }),
      ...(newStatus === 'completed' && { completion_time: new Date().toISOString() }),
    })
    .eq('id', shipment.id);

  if (error) {
    showToast('خطا در به‌روزرسانی وضعیت', 'error');
    return false;
  }

  await createShipmentEvent(shipment.id, newStatus, newStatus, shipment.status, note, userId);

  const otherId = shipment.shipper_id === userId ? shipment.driver_id : shipment.shipper_id;
  const statusLabels: Record<string, string> = {
    accepted: 'سفارش پذیرفته شد',
    picked_up: 'بارگیری انجام شد',
    in_transit: 'حمل آغاز شد',
    delivered: 'بار تحویل داده شد',
    completed: 'حمل تکمیل شد',
    cancelled: 'حمل لغو شد',
  };
  await createNotification(otherId, 'shipment_status_update', statusLabels[newStatus] || newStatus, undefined, shipment.id);

  return true;
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  if (error) return 0;
  return count || 0;
}
