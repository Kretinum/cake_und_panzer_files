package com.cake.noglint.mixin;

import net.minecraft.world.item.ItemStack;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

/**
 * Forces ItemStack#hasFoil() to false on the CLIENT only, so the enchantment
 * glint render layer is never submitted. Removes the glint render-pass cost
 * entirely (which Iris makes pathologically expensive on 1.21.1 — see Iris #2054),
 * with or without shaders. Purely cosmetic: enchanted items just lose their
 * sparkle. Client-only, so server-side logic and other clients are unaffected.
 */
@Mixin(ItemStack.class)
public class ItemStackMixin {

    @Inject(method = "hasFoil", at = @At("HEAD"), cancellable = true)
    private void noenchantglint$disableFoil(CallbackInfoReturnable<Boolean> cir) {
        cir.setReturnValue(false);
    }
}
