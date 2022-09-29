"use strict";

/**
 * event controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::event.event", ({ strapi }) => ({
  //create event with linked user
  async create(ctx) {
    const { id } = ctx.state.user; //ctx.state.user contains the current authenticated user
    const response = await super.create(ctx);
    const updatedResponse = await strapi.entityService.update(
      "api::event.event",
      response.data.id,
      { data: { user: id } }
    );
    return updatedResponse;
  },

  async me(ctx) {
    const user = await strapi.plugins[
      `users-permissions`
    ].services.jwt.getToken(ctx);

    if (!user) {
      return ctx.badRequest(null, [
        { messages: [{ id: "No authorization header was found" }] },
      ]);
    }

    const data = await strapi.entityService.findMany("api::event.event", {
      populate: "*",
      filters: { user: user.id },
    });

    if (!data) {
      return ctx.notFound();
    }
    const sanitizedEntity = await this.sanitizeOutput(data, ctx);

    return this.transformResponse(sanitizedEntity);
  },
}));
