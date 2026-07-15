package com.cake.ysmtaczfix.mixin;

import com.mojang.blaze3d.vertex.PoseStack;
import net.minecraft.client.CameraType;
import net.minecraft.client.Minecraft;
import net.minecraft.client.renderer.MultiBufferSource;
import net.minecraft.client.renderer.entity.EntityRenderDispatcher;
import net.minecraft.core.registries.BuiltInRegistries;
import net.minecraft.resources.ResourceLocation;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.item.ItemStack;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

/**
 * Suppresses the local player's model render in FIRST PERSON while a TaCZ gun is
 * held. YSM draws the self-model (with its own gun) in first person on top of
 * TaCZ's first-person gun, producing a duplicate, unlit, mispositioned gun.
 *
 * YSM's own self-model render is gated by its EntityRenderDispatcher mixin
 * (@WrapWithCondition on EntityRenderer.render inside EntityRenderDispatcher#render),
 * so YSM's self render flows through EntityRenderDispatcher#render. Cancelling that
 * call at HEAD for (localPlayer + first-person + TaCZ gun) removes the YSM duplicate
 * while leaving TaCZ's own first-person gun (rendered via the hand renderer) intact.
 * Third person is untouched, so the full YSM model still shows normally.
 */
@Mixin(EntityRenderDispatcher.class)
public class EntityRenderDispatcherMixin {

    @Inject(method = "render", at = @At("HEAD"), cancellable = true)
    private void ysmtaczfix$hideSelfModelWithGun(Entity entity, double x, double y, double z,
                                                 float rotationYaw, float partialTicks,
                                                 PoseStack poseStack, MultiBufferSource bufferSource,
                                                 int packedLight, CallbackInfo ci) {
        Minecraft mc = Minecraft.getInstance();
        if (mc.player == null || entity != mc.player) {
            return; // only the local player's own model
        }
        if (mc.options.getCameraType() != CameraType.FIRST_PERSON) {
            return; // only first person; third person keeps the full model
        }
        ItemStack held = mc.player.getMainHandItem();
        if (held.isEmpty()) {
            return;
        }
        ResourceLocation id = BuiltInRegistries.ITEM.getKey(held.getItem());
        if (id != null && "tacz".equals(id.getNamespace())) {
            ci.cancel();
        }
    }
}
