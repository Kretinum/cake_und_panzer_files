package com.cake.btpaerofix.mixin;

import dev.ryanhcode.sable.Sable;
import io.socol.betterthirdperson.impl.PlayerAdapter;
import net.minecraft.world.entity.player.Player;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

/**
 * Makes Better Third Person yield the camera while the player is piloting a
 * Create Aeronautics ship (a Sable "SubLevel").
 *
 * BTP activates its custom third-person camera unless the player is a vanilla
 * passenger of a non-allowed vehicle:
 *   mustHaveCustomCamera = !( ... || (player.isPassenger() && !hasAllowedVehicle()) || ... )
 * where hasAllowedVehicle() is only Horse/Pig. When you steer an Aeronautics ship
 * from a Handle / steering wheel you are NOT a vanilla passenger
 * (player.isPassenger()==false, getVehicle()==null) — you're bound to the ship by
 * Sable's tracking field — so BTP thinks you're a free-standing player and hijacks
 * the camera, breaking the F5 ship view.
 *
 * We report isPassenger()==true whenever Sable says the player is on a ship
 * (tracking OR seated-vehicle sublevel). Since an Aeronautics ship is never a
 * Horse/Pig, BTP's own "riding a not-allowed vehicle" branch then fires, cleanly
 * tears down the custom camera (mustHaveCustomCamera recomputes to false), and the
 * vanilla / Sable ship camera takes over. Client-only; PlayerAdapter is BTP's own
 * wrapper, so nothing outside BTP sees this.
 */
@Mixin(PlayerAdapter.class)
public abstract class PlayerAdapterMixin {

    @Inject(method = "isPassenger", at = @At("HEAD"), cancellable = true)
    private void btpaerofix$aeroShipCountsAsVehicle(CallbackInfoReturnable<Boolean> cir) {
        Player p = ((PlayerAdapter) (Object) this).player();
        if (p != null && Sable.HELPER.getTrackingOrVehicleSubLevel(p) != null) {
            cir.setReturnValue(true);
        }
    }
}
