import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Review {
  id: string;
  product_id: string;
  order_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface ReviewEligibility {
  canReview: boolean;
  existingReview: Review | null;
  canEdit: boolean;
}

export function useReviews() {
  const { user } = useAuth();

  const checkReviewEligibility = useCallback(async (
    productId: string,
    orderId: string
  ): Promise<ReviewEligibility> => {
    if (!user) {
      return { canReview: false, existingReview: null, canEdit: false };
    }

    try {
      // Check if review already exists
      const { data: existingReview } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", productId)
        .eq("buyer_id", user.id)
        .maybeSingle();

      if (existingReview) {
        const createdAt = new Date(existingReview.created_at);
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const canEdit = createdAt > sevenDaysAgo;
        
        return { 
          canReview: false, 
          existingReview, 
          canEdit 
        };
      }

      // Check if order is delivered and contains this product
      const { data: order } = await supabase
        .from("orders")
        .select(`
          id,
          status,
          buyer_id
        `)
        .eq("id", orderId)
        .eq("buyer_id", user.id)
        .eq("status", "delivered")
        .maybeSingle();

      if (!order) {
        return { canReview: false, existingReview: null, canEdit: false };
      }

      // Check if product was in this order
      const { data: orderItem } = await supabase
        .from("order_items")
        .select("id")
        .eq("order_id", orderId)
        .eq("product_id", productId)
        .maybeSingle();

      return { 
        canReview: !!orderItem, 
        existingReview: null, 
        canEdit: false 
      };
    } catch (error) {
      console.error("Error checking review eligibility:", error);
      return { canReview: false, existingReview: null, canEdit: false };
    }
  }, [user]);

  const getProductReviewByUser = useCallback(async (productId: string): Promise<Review | null> => {
    if (!user) return null;

    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .eq("buyer_id", user.id)
      .maybeSingle();

    return data;
  }, [user]);

  const getDeliveredOrdersWithProduct = useCallback(async (productId: string) => {
    if (!user) return [];

    const { data: orders } = await supabase
      .from("orders")
      .select(`
        id,
        order_number,
        status,
        created_at
      `)
      .eq("buyer_id", user.id)
      .eq("status", "delivered");

    if (!orders) return [];

    // Check which orders contain this product
    const ordersWithProduct = [];
    
    for (const order of orders) {
      const { data: orderItem } = await supabase
        .from("order_items")
        .select("id")
        .eq("order_id", order.id)
        .eq("product_id", productId)
        .maybeSingle();

      if (orderItem) {
        ordersWithProduct.push(order);
      }
    }

    return ordersWithProduct;
  }, [user]);

  return {
    checkReviewEligibility,
    getProductReviewByUser,
    getDeliveredOrdersWithProduct,
  };
}
