package com.cake.graveyardfix.mixin;

import com.finallion.graveyard.entities.NamelessHangedEntity;
import net.minecraft.world.InteractionHand;
import net.minecraft.world.InteractionResult;
import net.minecraft.world.entity.npc.AbstractVillager;
import net.minecraft.world.entity.player.Player;
import net.minecraft.world.level.Level;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

/**
 * Fixes a hard client crash in The Graveyard 2.6.2.
 *
 * NamelessHangedEntity#mobInteract does, inside its night branch:
 *   if (!this.getOffers().isEmpty() && !this.level().isClientSide) { ...open trade... }
 * Java evaluates && left-to-right, so getOffers() runs FIRST — and on the client
 * AbstractVillager#getOffers throws IllegalStateException("Cannot load Villager
 * offers on the client"). So right-clicking a Nameless Hanged AT NIGHT crashes the
 * client. (Daytime is fine: the outer isNight() guard skips this branch.)
 *
 * On the client the entire night branch has no side effects — every action inside is
 * gated behind !isClientSide — it only returns InteractionResult.sidedSuccess(true).
 * So we reproduce exactly that: on the client, when the same night-branch condition
 * holds, return sidedSuccess(true) at HEAD and never touch getOffers(). The server
 * path is completely untouched (this mixin is in the client list only).
 */
@Mixin(NamelessHangedEntity.class)
public abstract class NamelessHangedEntityMixin {

    @Inject(method = "mobInteract", at = @At("HEAD"), cancellable = true)
    private void graveyardfix$noClientGetOffers(Player player, InteractionHand hand,
                                                CallbackInfoReturnable<InteractionResult> cir) {
        AbstractVillager self = (AbstractVillager) (Object) this;
        Level level = self.level();
        // Mirror the mod's own night-branch condition; only intercept on the client,
        // where getOffers() would otherwise throw.
        if (level.isClientSide() && self.isAlive() && !self.isTrading() && level.isNight()) {
            cir.setReturnValue(InteractionResult.sidedSuccess(true));
        }
    }
}
